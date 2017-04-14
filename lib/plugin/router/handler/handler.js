"use strict";

const {coroutine: co} = require('bluebird');

class Handler {
  constructor() {
    ['id', 'weight', 'path', 'alwaysProcess', 'allowShowLink', 'menu'].map(val => this[val] = this.constructor[val]);
  }

  /**
   * Determines whether or not this handler will allow access to the url in
   * context.request.  May set context.httpResponse.
   **/
  allowAccess(context) {
    return Promise.resolve(true);
  }

  /**
   * Choose whether or not to "vouch" for a link.  The path provided is usually
   * about to be shown in a menu listing, so this function is a test of whether
   * or not it should actually be displayed.  It will usually piggyback
   * functionality from the allowAccess() function, but must not allow
   * httpResponse to be altered.
   **/
  showLink(path, context) {
    return co(function*(self){
      // "Vouch" for the link iff the path matches and allowAccess() is true.
      let show = false;
      if (path === self.path) {
        // Protect context.httpResponse from being overwritten.
        let originalHttpResponse = context.httpResponse;
        show = yield self.allowAccess(context);
        context.httpResponse = originalHttpResponse;
      }
      return show;
    })(this);
  }

  init(context) {
    this.context = context;
    return Promise.resolve();
  }
}

Handler.alwaysProcess = false;
Handler.allowShowLink = false;

module.exports = Handler;
