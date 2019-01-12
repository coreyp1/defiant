"use strict";

const Renderable = require('../../theme/renderable');
const path = require('path');

class Page extends Renderable {
  async init(context) {
    await super.init(context);

    // Add the default CSS & Javascript Files.
    context.engine.library.require(context, 'Materialize');

    // Add any library JavaScript & CSS.
    context.engine.library.process(context);
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
