"use strict";

const Handler = require('../../router/handler');

class AlwaysProcessHandler extends Handler {
  init(context) {
    console.log(this.constructor.id, '/' + context.request.urlTokenized.join('/'));
    return Promise.resolve();
  }
}

AlwaysProcessHandler.alwaysProcess = true;
AlwaysProcessHandler.id = 'Example.AlwaysProcessHandler';
AlwaysProcessHandler.path = '';
AlwaysProcessHandler.weight = 1000;

module.exports = AlwaysProcessHandler;
