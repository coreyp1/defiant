"use strict";

const Response = require('./response');

class Themed extends Response {
  commit() {
    this.data.message = this.context.message.commit();
    let renderable = new (this.context.theme.getRenderable('Page'))(this.data);
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(renderable.templateFunction());
    this.context.response.end();
  }
}

module.exports = Themed;
