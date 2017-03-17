"use strict";

const Handler = require('../../router/handler');
const isEmptyObject = require('../../../util/isEmptyObject');
const {coroutine: co, promisify} = require('bluebird');

class SessionHandler extends Handler {
  init(context) {
    return co(function*(self) {
      let Session = context.engine.plugin.get('Session');
      let currentTime = Math.round(new Date().getTime() / 1000),
          newExpiration = currentTime + Session.lifetime;
          
      // Try to load a session if it exists.
      yield Session.sessionReader(context.request, context.response);

      if ((!context.request.sessionid) || (!context.request.sessionid.id)) {
        // No session exists, so create one.
        return Session.generateSession(context);
      }

      // The connection claims a session.  Is it already loaded?
      if (Session.sessions[context.request.sessionid.id]) {
        let session = Session.sessions[context.request.sessionid.id];
        // Has the session expired?
        if (currentTime > session.expire) {
          delete Session.sessions[session.id];
          yield Session.deleteSessionFile(session.id);
          return Session.generateSession(context);
        }
        // Update the session.
        session.expire = newExpiration;
        yield Session.writeSessionFile(session);
        context.request.session = session;
        return;
      }

      // The session does not exist in memory.  Try to load it from a file.
      let session = yield Session.readSessionFile(context.request.sessionid.id);
      if (!session || isEmptyObject(session)) {
        return Session.generateSession(context);
      }

      // Has the session expired?
      if (currentTime > session.expire) {
        yield Session.deleteSessionFile(session.id);
        return Session.generateSession(context);
      }

      // The session exists.  Update it.
      Session.sessions[session.id] = session;
      session.expire = newExpiration;
      yield Session.writeSessionFile(session);
      context.request.session = session;
    })(this);
  }
}

SessionHandler.id = 'Session.SessionHandler';
SessionHandler.path = '';
SessionHandler.weight = -550;

module.exports = SessionHandler;
