"use strict";

const Plugin = require('../plugin');
const uuid = require('node-uuid');
const crypto = require('crypto');
const Path = require('path');
const Data = require('../settings/data');
const clientSessions = require('client-sessions');

//const Data = require('defiant/plugin/settings/data');

// TODO: This entire thing is pre-alpha code quality (i.e. horrible).

//let sessionFile = Path.join(os.tmpdir(), 'sessions.json');

class Session extends Plugin {
  constructor(engine) {
    super(engine);
    this.sessions = {};
    // TODO: Come up with a way to track the age of this session.
    this.volatile = {};

    // Add session information to incoming HTTP requests.
    engine.pluginRegistry.get('Router').addHandler(new (require('./handler/sessionHandler'))());

    // The number of seconds that a session can last past its last use.
    this.sessionLifetime = 60 * 60 * 24 * 30;
  }

  async init() {
    let Settings = this.engine.pluginRegistry.get('Settings');

    // Declare the Session Reader Data item and set its defaults.
    Settings.cacheRegistry.set(new Data({
      id: `session/sessionReader.json`,
      filename: Path.join('session', `sessionReader.json`),
      storage: 'settings',
      storageCanChange: true,
      // TODO: Translate.
      description: 'Stores the settings for the Session Reader.',
      default: {
        cookieName: 'sessionId',
        secret: '',
        // Default duration one week.
        duration: 7 * 24 * 60 * 60 * 1000,
      },
    }));

    // Load the actual values.
    let sessionSettings = Settings.cacheRegistry.get(`session/sessionReader.json`);
    let sessionSettingsData = await sessionSettings.load();
    if (!sessionSettingsData.secret) {
      // Generate a random secret and save it for future use.
      sessionSettingsData.secret = uuid.v4();
      let e = await sessionSettings.save();
      if (e) {
        // TODO: Translate.
        console.error(`Could not write Session Reader settings file.`);
      }
    }

    // Initialize the Session Reader function.
    let sessionReader = clientSessions(sessionSettingsData);
    this.sessionReader = async (req, res) => {
      await new Promise((accept, reject) => {
        sessionReader(req, res, () => {
          accept();
        });
      });
    };
  }

  // Read a session file from disk.
  async readSessionFile(id) {
    return new Data({
      filename: Path.join(id.substring(0, 2), id + '.json'),
      storage: 'sessions',
      default: undefined
    }, this.engine.pluginRegistry.get('Settings')).load();
  }

  // Write a session file to disk.
  async writeSessionFile(session) {
    return new Data({
      filename: Path.join(session.id.substring(0, 2), session.id + '.json'),
      storage: 'sessions',
      data: session
    }, this.engine.pluginRegistry.get('Settings')).save();
  }

  // Delete a session file from disk.
  async deleteSessionFile(id) {
    return new Data({
      filename: Path.join(id.substring(0, 2), id + '.json'),
      storage: 'sessions',
    }, this.engine.pluginRegistry.get('Settings')).remove();
  }

  async generateSession(context) {
    let newID,
        currentTime = Math.round(new Date().getTime() / 1000);
    do {
      newID = uuid.v4();
    } while (this.sessions[newID]);

    let session = {
      id: newID,
      expire: currentTime + this.sessionLifetime
    };

    let buff = await new Promise((accept, reject) => {
      crypto.randomBytes(32, (ex, buf) => {accept(buf);});
    });
    session.formApiKey = buff.toString('base64');
    session.formApiKeyRaw = buff.toString('binary');
    this.sessions[session.id] = session;
    this.volatile[session.id] = {};
    context.request.sessionId = {
      id: session.id
    };
    context.session = session;
  }

  // Cron not implemented yet...
  /*
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
  }
  */
}

// The number of seconds between cron runs.
Session.cronFrequency = 60;

module.exports = Session;
