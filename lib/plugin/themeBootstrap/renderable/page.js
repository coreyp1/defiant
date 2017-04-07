"use strict";

const ThemeBasePage = require('../../themeBase/renderable/page');
const path = require('path');
const {coroutine: co} = require('bluebird');

class Page extends ThemeBasePage {
  init(context) {
    return co(function*(self, superInit){
      superInit.call(self, context);

      // Add the default CSS & Javascript Files.
      context.css.set({
        id: 'bootstrap',
        url: '/file/theme/bootstrap/css/bootstrap.css',
        path: path.join(path.dirname(require.resolve('bootstrap')), '../css/bootstrap.css'),
        weight: 100,
      });
      context.css.set({
        id: 'themeBootstrap',
        url: '/file/theme/themeBootstrap/css/themeBootstrap.css',
        path: path.join(__dirname, '../file/css/themeBootstrap.css'),
        weight: 100,
      });
      context.jsFooter.set({
        id: 'bootstrap',
        url: '/file/theme/bootstrap/js/bootstrap.min.js',
        path: path.join(path.dirname(require.resolve('bootstrap')), '../js/bootstrap.js'),
        weight: 100,
      });
      context.jsFooter.set({
        id: 'themeBootstrap',
        url: '/file/theme/themeBootstrap/js/themeBootstrap.js',
        path: path.join(__dirname, '../file/js/themeBootstrap.js'),
        weight: 100,
      });
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
