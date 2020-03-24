"use strict";

const Plugin = require('../plugin');
const uuid = require('node-uuid');
const crypto = require('crypto');
const Path = require('path');
const Data = require('../settings/data');
const clientSessions = require('client-sessions');

/**
 * The Session plugin manages a user's session and the applicable information.
 *
 * This code is alpha-quality.  It works but everything is hard-coded.
 * @todo Improve the quality and configurability of the Session plugin.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Session extends Plugin {
  /**
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin.Session}
   *   The instantiated Session plugin.
   */
  constructor(engine) {
    super(engine);
    /**
     * @member {Object} Defiant.Plugin.Sessions#sessions
     *   For tracking the sessions objects.
     */
    this.sessions = {};
    // TODO: Come up with a way to track the age of this session.

    /**
     * @member {Object} Defiant.Plugin.Sessions#volatile
     *   For tracking the volatile sessions objects.  This is information which
     *   should be given to the user, but it is not the end of the world if the
     *   contents are lost.
     *
     *   Sessions are ultimately stored on disk in a file.  This information is
     *   stored in RAM.  If the server dies, it is wiped.
     */
    this.volatile = {};

    // Add session information to incoming HTTP requests.
    engine.pluginRegistry.get('Router').addHandler(new (require('./handler/sessionHandler'))());

    /**
     * @member {number} Defiant.Plugin.Session#sessionLifetime
     *   The number of seconds that a session can last past its last use.
     */
    this.sessionLifetime = 60 * 60 * 24 * 30;
  }

  /**
   * All plugins will be initialized in order of their weight by
   * {@link Defiant.Engine#init}.
   * @function
   * @async
   */
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

  /**
   * Read a session file from disk.
   * @function
   * @async
   * @param {String} id
   *   The id of the session to be loaded.
   * @returns {Defiant.Plugin.Settings.Data}
   *   The session as a Data object.
   */
  async readSessionFile(id) {
    return new Data({
      filename: Path.join(id.substring(0, 2), id + '.json'),
      storage: 'sessions',
      default: undefined
    }, this.engine.pluginRegistry.get('Settings')).load();
  }

  /**
   * Write a session file to disk.
   * @function
   * @async
   * @param {Mixed} session
   *   The session information.
   * @returns {Defiant.Plugin.Settings.Data}
   *   The session as a Data object.
   */
  async writeSessionFile(session) {
    return new Data({
      filename: Path.join(session.id.substring(0, 2), session.id + '.json'),
      storage: 'sessions',
      data: session
    }, this.engine.pluginRegistry.get('Settings')).save();
  }

  /**
   * Delete a session file from disk.
   * @param {String} id
   *   The id of the session.
   * @returns {Object}
   *   The result of the file delete.
   */
  async deleteSessionFile(id) {
    return new Data({
      filename: Path.join(id.substring(0, 2), id + '.json'),
      storage: 'sessions',
    }, this.engine.pluginRegistry.get('Settings')).remove();
  }

  /**
   * Generate a new session for the current request.  The session is added to
   * the Context.
   * @function
   * @async
   * @param {Defiant.Context}
   *   The request context.
   */
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
