"use strict";

const Response = require('./response');
const {coroutine:co} = require('bluebird');

class Themed extends Response {
  commit() {
    return co(function*(self){
      let layout = new(self.context.layout)({content: self.data.content});
      yield layout.init(self.context);
      self.data.content = layout.commit();
      let renderable = new (self.context.theme.getRenderable('Page'))(self.data);
      self.context.response.setHeader("Content-Type", 'text/html');
      self.context.response.write(renderable.templateFunction());
      self.context.response.end();
    })(this);
  }
}

module.exports = Themed;
