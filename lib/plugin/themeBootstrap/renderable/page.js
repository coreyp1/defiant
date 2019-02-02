"use strict";

const ThemeBasePage = require('../../themeBase/renderable/page');

class Page extends ThemeBasePage {
  async init(context, data={}) {
    // Add the default CSS & Javascript Files.
    context.engine.library.require(context, 'Bootstrap');

    return await super.init(context, data);
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
