"use strict";

const Handler = require('../router/handler');
const Themed = require('../http/response/themed');
const {coroutine: co} = require('bluebird');

class FapiHandler extends Handler {
  init(context) {
    let theme = context.theme;
    return co(function*() {
      context.httpResponse = new Themed(context);
      context.httpResponse.page = {
        language: 'us',
        siteName: 'Defiant FAPI Demo',
        head: '',
        jsFooter: '',
        content: 'This is fapi content.',
      };
    })();
  }
}

FapiHandler.id = 'Example.FapiHandler';
FapiHandler.path = 'example.fapi';

module.exports = FapiHandler;
