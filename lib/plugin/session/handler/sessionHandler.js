"use strict";

const Handler = require('../../router/handler');
const isEmptyObject = require('../../../util/isEmptyObject');

class SessionHandler extends Handler {
  async init(context) {
    let Session = context.engine.pluginRegistry.get('Session');

    // Use a Promise just to clean up the code execution flow.
    // TODO: Rework.
    await new Promise(async(accept, reject) => {
      let currentTime = Math.round(new Date().getTime() / 1000),
          newExpiration = currentTime + Session.sessionLifetime;
          
      // Try to load a session if it exists.
      await Session.sessionReader(context.request, context.response);

      if ((!context.request.sessionId) || (!context.request.sessionId.id)) {
        // No session exists, so create one.
        await Session.generateSession(context);
        return accept();
      }

      // The connection claims a session.  Is it already loaded?
      if (Session.sessions[context.request.sessionId.id]) {
        let session = Session.sessions[context.request.sessionId.id];
        // Has the session expired?
        if (currentTime > session.expire) {
          delete Session.sessions[session.id];
          await Session.deleteSessionFile(session.id);
          await Session.generateSession(context);
          return accept();
        }
        // Update the session.
        session.expire = newExpiration;
        await Session.writeSessionFile(session);
        context.session = session;
        return accept();
      }

      // The session does not exist in memory.  Try to load it from a file.
      let session = await Session.readSessionFile(context.request.sessionId.id);
      if (!session || isEmptyObject(session)) {
        await Session.generateSession(context);
        return accept();
      }

      // Has the session expired?
      if (currentTime > session.expire) {
        await Session.deleteSessionFile(session.id);
        await Session.generateSession(context);
        return accept();
      }

      // The session exists.  Update it.
      Session.sessions[session.id] = session;
      session.expire = newExpiration;
      await Session.writeSessionFile(session);
      context.session = session;
      return accept();
    });

    // Set the volatile session object.
    if (!Session.volatile[context.session.id]) {
      Session.volatile[context.session.id] = {};
    }
    context.volatile = Session.volatile[context.session.id];
  }
}

SessionHandler.id = 'Session.SessionHandler';
SessionHandler.path = '';
SessionHandler.weight = -550;

module.exports = SessionHandler;
