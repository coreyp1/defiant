"use strict";

const Handler = require('./handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class AccessDeniedHandler extends Handler {
  canAccess(context) {
    // Grant access if the httpResponse is 403.
    return Promise.resolve(context.httpResponse === 403);
  }
  init(context) {
    return co(function*() {
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: '<h1>403</h1><p>Access Denied</p>',
      }, 403);
    })();
  }
}

AccessDeniedHandler.id = 'Router.AccessDeniedHandler';
AccessDeniedHandler.path = '';
AccessDeniedHandler.weight = 10000;
AccessDeniedHandler.alwaysProcess = true;

module.exports = AccessDeniedHandler;
