"use strict";

const Plugin = require('../../plugin');
const path = require('path');

class JQuery extends Plugin {
  constructor(engine){
    super(engine);
    engine.plugin.get('Router')
      .addHandler(new(require('./handler/jQueryHandler'))())
      .addHandler(new(require('./handler/directoryHandler'))());

    engine.library.register({
      id: 'jQuery',
      jsFooter: [{
        id: 'jQuery',
        url: '/file/library/jQuery/jquery.min.js',
      },
      {
        id: 'jQuery.noConflict',
        url: '/file/library/jQueryShim/jQueryNoConflict.js',
        path: path.join(__dirname, '../file/jQueryNoConflict.js')
      }],
    });
  }
}

module.exports = JQuery;
