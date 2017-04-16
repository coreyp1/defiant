"use strict";

const Renderable = require('../../theme/renderable');
const path = require('path');
const {coroutine: co} = require('bluebird');

class Page extends Renderable {
  init(context) {
    return co(function*(self, superInit){
      superInit.call(self, context);
      /*
      // Add the default CSS & Javascript Files.
      context.css.set({
        id: 'themeBase',
        url: '/file/theme/themeBase/css/style.css',
        path: path.join(__dirname, '../file/css/style.css'),
        weight: -450,
      });

      // Example setting Internal CSS.
      context.css.set({
        id: 'themeBaseInline',
        data: '',
      });

      context.jsFooter.set({
        id: 'themeBase',
        url: '/file/theme/themeBase/js/themeBase.js',
        path: path.join(__dirname, '../file/js/themeBase.js'),
        weight: -450,
      });

      // Example setting Internal JavaScript.
      context.js.set({
        id: 'themeBaseInline',
        data: '',
      });
      */

      // Add any library JavaScript & CSS.
      context.engine.library.process(context);
    })(this, super.init);
  }
}

Page.templateFile = __dirname + '/../html/page.html';
Page.variables = [
  'language',
  'siteName',
  'head',
  'jsFooter',
  'content',
];

module.exports = Page;
