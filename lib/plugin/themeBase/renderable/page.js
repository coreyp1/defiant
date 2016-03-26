"use strict";

const Renderable = require('../../theme/renderable');

class Page extends Renderable {}

Page.templateFile = __dirname + '/../html/page.html';
Page.variables = [
  'language',
  'siteName',
  'head',
  'jsFooter',
  'content',
];

module.exports = Page;
