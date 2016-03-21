"use strict";

const Response = require('./response');

class Themed extends Response {
  constructor(context) {
    super(context);
    this.data = '';
  }

  commit() {
    let renderable = this.context.theme.renderable[this.data.type];
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(renderable.templateFunction({
      'language': 'us',
      'siteName': 'Foo',
      'head': '',
      'layout': '',
      'jsFooter': '',
      'content': this.data.content,
    }));
    this.context.response.end();
  }
}

module.exports = Themed;
