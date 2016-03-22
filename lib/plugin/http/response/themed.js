"use strict";

const Response = require('./response');

class Themed extends Response {
  commit() {
    let renderable = new (this.context.theme.getRenderable('Page'))(this.context);
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(renderable.templateFunction(this.page));
    this.context.response.end();
  }
}

module.exports = Themed;
