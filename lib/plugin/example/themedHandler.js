"use strict";

const Handler = require('../router/handler');
const Themed = require('../http/response/themed');
const {coroutine: co} = require('bluebird');

class ThemedHandler extends Handler {
  init(context) {
    let theme = context.theme;
    return co(function*() {
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: 'This is themed content.',
      });
    })();
  }
}

ThemedHandler.id = 'Example.ThemedHandler';
ThemedHandler.path = 'example.themed';

module.exports = ThemedHandler;
