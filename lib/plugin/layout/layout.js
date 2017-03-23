"use strict";

const Plugin = require('../plugin');
const Registry = require('../../util/registry');
const {coroutine: co, promisify} = require('bluebird');

class Layout extends Plugin {
  constructor(engine) {
    super(engine);
    this.layouts = new Registry();
    this.layouts.set(require('./layout/defaultLayoutRenderable'));

    this.widgets = new Registry();
    this.widgets.set(require('./widget/contentWidget'));

    engine.plugin.get('Router').router
      .addHandler(require('./handler/layoutHandler'))
  }

  init() {
    return co(function*(self){
    })(this);
  }
}

module.exports = Layout;
