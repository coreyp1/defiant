"use strict";

const Renderable = require('../../theme/renderable');

class Page extends Renderable {
  async init(context, data={}) {
    // Add the default CSS & Javascript Files.
    context.engine.library.require(context, 'Materialize');

    // Add any library JavaScript & CSS.
    context.engine.library.process(context);

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
