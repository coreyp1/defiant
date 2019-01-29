"use strict";

const ThemeBasePage = require('../../themeBase/renderable/page');

class Page extends ThemeBasePage {
  async init(context) {
    // Add the default CSS & Javascript Files.
    context.engine.library.require(context, 'Bootstrap');

    await super.init(context);
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
