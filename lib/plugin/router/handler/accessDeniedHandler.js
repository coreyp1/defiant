"use strict";

const Handler = require('./handler');
const Themed = require('../../http/response/themed');

class AccessDeniedHandler extends Handler {
  async allowAccess(context) {
    // Grant access if the httpResponse is 403.
    return context.httpResponse === 403;
  }

  async init(context) {
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: '<h1>403</h1><p>Access Denied</p>',
    }, 403);
  }
}

AccessDeniedHandler.id = 'Router.AccessDeniedHandler';
AccessDeniedHandler.path = '';
AccessDeniedHandler.weight = 10000;
AccessDeniedHandler.alwaysProcess = true;

module.exports = AccessDeniedHandler;
