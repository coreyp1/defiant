"use strict";

const Widget = require('./widget');
const merge = require('../../../util/merge');
const {coroutine: co} = require('bluebird');

class TitleWidget extends Widget {
  init(context, data) {
    return co(function*(self, superInit){
      yield superInit.call(self, context, data);
      merge(self.data, {
        // TODO: Translate.
        // TODO: Escape.
        content: context.page && context.page.title ? context.page.title : '',
      });
    })(this, super.init);
  }
}

TitleWidget.id = 'Layout.TitleWidget';
// TODO: Translate.
TitleWidget.title = 'Page Title';
TitleWidget.description = 'Shows the title of the page.';
TitleWidget.templateFile = __dirname + '/../html/titleWidget.html';

module.exports = TitleWidget;
