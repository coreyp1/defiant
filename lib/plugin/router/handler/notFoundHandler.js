"use strict";

const Handler = require('./handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class NotFoundHandler extends Handler {
  allowAccess(context) {
    // Grant access if the httpResponse is 404.
    // Grant access if there is no httpResponse (catch-all).
    return Promise.resolve(context.httpResponse === 404 || context.httpResponse === undefined);
  }
  init(context) {
    return co(function*() {
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: '<h1>404</h1><p>Not Found</p>',
      }, 404);
    })();
  }
}

NotFoundHandler.id = 'Router.NotFoundHandler';
NotFoundHandler.path = '';
NotFoundHandler.weight = 10000;
NotFoundHandler.alwaysProcess = true;

module.exports = NotFoundHandler;
