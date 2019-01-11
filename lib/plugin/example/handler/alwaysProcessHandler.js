"use strict";

const Handler = require('../../router/handler');

class AlwaysProcessHandler extends Handler {
  async init(context) {
    // Just log the url request.
    console.log(this.constructor.id, '/' + context.request.urlTokenized.join('/'));
  }
}

AlwaysProcessHandler.alwaysProcess = true;
AlwaysProcessHandler.id = 'Example.AlwaysProcessHandler';
AlwaysProcessHandler.path = '';
AlwaysProcessHandler.weight = 1000;

module.exports = AlwaysProcessHandler;
