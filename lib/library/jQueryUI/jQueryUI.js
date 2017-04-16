"use strict";

const Plugin = require('../../plugin');
const path = require('path');

class JQueryUI extends Plugin {
  constructor(engine){
    super(engine);
    engine.plugin.get('Router')
      .addHandler(new(require('./handler/jQueryUIHandler'))());

    engine.library.register({
      id: 'jQueryUI',
      require: ['jQuery'],
      css: [{
        id: 'jQueryUI',
        url: '/file/library/jQueryUI/jquery-ui.css',
      }],
      jsFooter: [{
        id: 'jQueryUI',
        url: '/file/library/jQueryUI/jquery-ui.min.js',
      }],
    });
  }
}

module.exports = JQueryUI;
