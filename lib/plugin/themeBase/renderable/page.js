"use strict";

const Renderable = require('../../theme/renderable');
const path = require('path');
const {coroutine: co} = require('bluebird');

class Page extends Renderable {
  init(context) {
    return co(function*(self, superInit){
      superInit.call(self, context);
      // Add the default CSS & Javascript Files.
      context.engine.library.require(context, 'Materialize');

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
