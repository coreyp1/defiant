"use strict";

const Handler = require('../router/handler');
const Themed = require('../http/response/themed');
const {coroutine: co} = require('bluebird');

class FapiHandler extends Handler {
  init(context) {
    let form = new (context.engine.plugin.get('Fapi').getForm('ExampleForm'))();
    return co(function*(self, superInit) {
      yield superInit.call(self, context);
      yield form.init(context, {
        attributes: {
          class: 'foo bar baz',
          id: 'yo',
        },
      });
      context.httpResponse = new Themed(context);
      context.httpResponse.page = {
        language: 'us',
        siteName: 'Defiant FAPI Demo',
        head: '',
        jsFooter: '',
        content: form.commit(),
      };
    })(this, super.init);
  }
}

FapiHandler.id = 'Example.FapiHandler';
FapiHandler.path = 'example.fapi';

module.exports = FapiHandler;
