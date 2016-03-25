"use strict";

const Plugin = require('../plugin');
const uuid = require('node-uuid');
const crypto = require('crypto');
const path = require('path');
const os = require('os');
const clientSessions = require('client-sessions');
const {coroutine: co, promisify} = require('bluebird');

//const Data = require('defiant/plugin/settings/data');

// TODO: This entire thing is pre-alpha code quality (i.e. horrible).

let sessions = {};

//let sessionFile = path.join(os.tmpDir(), 'sessions.json');

class Session extends Plugin {
  constructor(engine) {
    super(engine);
    this.sessions = {};
    engine.registry.http.incoming.set({id: 'sessionLoad', weight: -550, incoming: (...args) => this.incomingLoadSession(...args)});

    // TODO: Secret should be customizable.  This is just to get it started.
    let sessionReader = clientSessions({
      cookieName: 'sessionid',
      secret: 'foozeball',
      duration: 7 * 24 * 60 * 60 * 1000
    });
    engine.registry.http.incoming.set({id: 'sessionReader', weight: -575, incoming: ({request, response}) => co(function*() {
      return promisify(sessionReader)(request, response);
    })()});
  }

  // Read a session file from disk.
  readSessionFile(id) {
    return Promise.resolve(false);
  }

  // Write a session file to disk.
  writeSessionFile(session) {
    return Promise.resolve();
  }

  // Delete a session file from disk.
  deleteSessionFile(id) {
    return Promise.resolve();
  }

  // Load a session from memory, falling back to disk, then to basic generation.
  incomingLoadSession(context) {
    let self = this;
    return co(function*() {
      let currentTime = Math.round(new Date().getTime() / 1000),
          newExpiration = currentTime + Session.lifetime;

      if ((!context.request.sessionid) || (!context.request.sessionid.id)) {
        // No session exists, so create one.
        return self.generateSession(context);
      }

      // The connection claims a session.  Is it already loaded?
      if (sessions[context.request.sessionid.id]) {
        let session = sessions[context.request.sessionid.id];
        // Has the session expired?
        if (currentTime > session.expire) {
          delete sessions[session.id];
          yield self.deleteSessionFile(session.id);
          return self.generateSession(context);
        }
        // Update the session.
        session.expire = newExpiration;
        yield self.writeSessionFile(session);
        context.request.session = session;
        return;
      }

      // The session does not exist in memory.  Try to load it from a file.
      let session = yield self.readSessionFile(context.request.sessionid.id);
      if (!session) {
        return self.generateSession(context);
      }
      // Has the session expired?
      if (currentTime > session.expire) {
        yield self.deleteSessionFile(session.id);
        return self.generateSession(context);
      }
      // Lastly, just update the session.
      sessions[session.id] = session;
      session.expire = newExpiration;
      yield self.writeSessionFile(session);
      context.request.session = session;
    })();
  }

  generateSession(context) {
    let newID,
        currentTime = Math.round(new Date().getTime() / 1000);
    do {
      newID = uuid.v4();
    } while (sessions[newID]);

    let session = {
      id: newID,
      expire: currentTime + Session.lifetime
    };

    return promisify(crypto.randomBytes)(32)
      .then((buff) => {
        session.fapikey = buff.toString('base64');
        session.fapikeyraw = buff.toString('binary');
        sessions[session.id] = session;
        context.request.sessionid = {
          id: session.id
        };
        context.request.session = session;
      });
  }

  // Cron not implemented yet...
  cron() {
    let currentTime = Math.round(new Date().getTime() / 1000);
    let killTime = currentTime + Session.lifetime;
    for (let key in sessions) {
      if (sessions[key].expire < currentTime) {
        console.log('Delete: ' + key);
        delete sessions[key];
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

// The number of seconds that a session can last past its last use.
Session.lifetime = 60 * 60 * 24 * 30;

module.exports = Session;
