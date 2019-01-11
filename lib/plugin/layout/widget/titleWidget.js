"use strict";

const Widget = require('./widget');
const merge = require('../../../util/merge');

class TitleWidget extends Widget {
  async init(context, data) {
    await super.init(context, data);
    merge(this.data, {
      // TODO: Translate.
      // TODO: Escape.
      content: context.page && context.page.title ? context.page.title : '',
    });
  }
}

TitleWidget.id = 'Layout.TitleWidget';
// TODO: Translate.
TitleWidget.title = 'Page Title';
TitleWidget.description = 'Shows the title of the page.';
TitleWidget.templateFile = __dirname + '/../html/titleWidget.html';

module.exports = TitleWidget;
