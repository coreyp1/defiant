"use strict";

const Handler = require('./handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class VirtualHandler extends Handler {
  /**
   * data = {
   *   id,
   *   weight,
   *   path,
   *   alwaysProcess,
   *   allowShowLink,
   *   allowAccess,
   *   menu,
   *   renderable,
   * }
   */
  constructor(data={}) {
    super(data);
    this.renderable = data.renderable;
  }

  init(context) {
    return co(function*(self) {
      let renderableData = {};
      yield self.renderable.init(context, renderableData);
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: self.renderable.commit(renderableData),
      });
    })(this);
  }
}

module.exports = VirtualHandler;
