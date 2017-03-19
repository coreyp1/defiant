"use strict";

const Plugin = require('../plugin');
const uuid = require('node-uuid');
const crypto = require('crypto');
const Path = require('path');
const os = require('os');
const Data = require('../settings/data');
const clientSessions = require('client-sessions');
const {coroutine: co, promisify} = require('bluebird');

//const Data = require('defiant/plugin/settings/data');

// TODO: This entire thing is pre-alpha code quality (i.e. horrible).

//let sessionFile = Path.join(os.tmpDir(), 'sessions.json');

class Session extends Plugin {
  constructor(engine) {
    super(engine);
    this.sessions = {};
    // TODO: Come up with a way to track the age of this session.
    this.volatile = {};

    // Add session information to incoming HTTP requests.
    engine.plugin.get('Router').router.addHandler(require('./handler/sessionHandler'));

    // The number of seconds that a session can last past its last use.
    this.sessionLifetime = 60 * 60 * 24 * 30;
  }

  init() {
    return co(function*(self){
      // TODO: Secret should be customizable.  This is just to get it started.
      self.sessionReader = promisify(clientSessions({
        cookieName: 'sessionId',
        secret: 'foozeball',
        duration: 7 * 24 * 60 * 60 * 1000
      }));
    })(this);
  }

  // Read a session file from disk.
  readSessionFile(id) {
    return new Data({
      filename: Path.join(id.substring(0, 2), id + '.json'),
      storage: 'sessions',
      default: undefined
    }, this.engine.plugin.get('Settings')).load();
  }

  // Write a session file to disk.
  writeSessionFile(session) {
    return new Data({
      filename: Path.join(session.id.substring(0, 2), session.id + '.json'),
      storage: 'sessions',
      data: session
    }, this.engine.plugin.get('Settings')).save();
  }

  // Delete a session file from disk.
  deleteSessionFile(id) {
    return new Data({
      filename: Path.join(id.substring(0, 2), id + '.json'),
      storage: 'sessions',
    }, this.engine.plugin.get('Settings')).remove();
  }

  generateSession(context) {
    let newID,
        currentTime = Math.round(new Date().getTime() / 1000);
    do {
      newID = uuid.v4();
    } while (this.sessions[newID]);

    let session = {
      id: newID,
      expire: currentTime + this.sessionLifetime
    };
    let self = this;

    return promisify(crypto.randomBytes)(32)
      .then((buff) => {
        session.fapikey = buff.toString('base64');
        session.fapikeyraw = buff.toString('binary');
        self.sessions[session.id] = session;
        self.volatile[session.id] = {};
        context.request.sessionId = {
          id: session.id
        };
        context.session = session;
      });
  }

  // Cron not implemented yet...
  cron() {
    let currentTime = Math.round(new Date().getTime() / 1000);
    let killTime = currentTime + this.sessionLifetime;
    for (let key in this.sessions) {
      if (this.sessions[key].expire < currentTime) {
        console.log('Delete: ' + key);
        delete this.sessions[key];
        delete this.volatile[key];
      }
    }
  }

  startCron() {
    if (this.cronID) {
      clearInterval(this.cronID);
    }
    this.cronID = setInterval(this.cron, Session.cronFrequency * 1000);
  };
}

// The number of seconds between cron runs.
Session.cronFrequency = 60;

module.exports = Session;
