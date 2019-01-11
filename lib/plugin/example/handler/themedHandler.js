"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');

class ThemedHandler extends Handler {
  async init(context) {
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: 'This is themed content.',
    });
  }
}

ThemedHandler.id = 'Example.ThemedHandler';
ThemedHandler.path = 'example.themed';
// TODO: Translate
ThemedHandler.menu = {
  menu: 'default',
  text: 'Themed Example',
  description: 'Example of outputting content on a themed page',
};

module.exports = ThemedHandler;
