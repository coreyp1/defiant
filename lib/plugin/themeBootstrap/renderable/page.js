"use strict";

const ThemeBasePage = require('../../themeBase/renderable/page');
const path = require('path');
const {coroutine: co} = require('bluebird');

class Page extends ThemeBasePage {
  init(context) {
    return co(function*(self, superInit){
      // Add the default CSS & Javascript Files.
      context.engine.library.require(context, 'Bootstrap');

      superInit.call(self, context);
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
