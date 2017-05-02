"use strict";

const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class Handler {
  /**
   * data = {
   *   id,
   *   weight,
   *   path,
   *   alwaysProcess,
   *   allowShowLink,
   *   allowAccess,
   *   menu,
   *   showLink,
   *   renderable,
   * }
   */
  constructor(data={}) {
    ['id', 'weight', 'path', 'alwaysProcess', 'allowShowLink', 'allowAccess', 'showLink', 'menu', 'renderable'].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
    this.data = data;
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
    return !this.renderable ? Promise.resolve() : co(function*(self) {
      // Call the renderable constructor, if it has not been called yet.
      let renderable = (typeof self.renderable === 'function') ? new self.renderable() : self.renderable;
      yield renderable.init(context);
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: renderable.commit(),
      });
    })(this);
  }
}

Handler.alwaysProcess = false;
Handler.allowShowLink = false;
Handler.renderable = undefined;

module.exports = Handler;
