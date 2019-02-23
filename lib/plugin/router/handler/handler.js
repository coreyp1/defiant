"use strict";

const Themed = require('../../http/response/themed');
const Renderable = require('../../theme/renderable');

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
  async allowAccess(context) {
    return true;
  }

  /**
   * Choose whether or not to "vouch" for a link.  The path provided is usually
   * about to be shown in a menu listing, so this function is a test of whether
   * or not it should actually be displayed.  It will usually piggyback
   * functionality from the allowAccess() function, but must not allow
   * httpResponse to be altered.
   **/
  async showLink(path, context) {
    // "Vouch" for the link iff the path matches and allowAccess() is true.
    let show = false;
    if (path === this.path) {
      // Protect context.httpResponse from being overwritten.
      let originalHttpResponse = context.httpResponse;
      show = await this.allowAccess(context);
      context.httpResponse = originalHttpResponse;
    }
    return show;
  }

  async init(context) {
    if (this.renderable && (this.renderable instanceof Renderable)) {
      let instance = this.renderable.newInstance(context);
      await instance.init();
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: await instance.commit(),
      });
    }
  }
}

Handler.alwaysProcess = false;
Handler.allowShowLink = false;
Handler.renderable = undefined;

module.exports = Handler;
