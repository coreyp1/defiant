"use strict";

const Widget = require('./widget');
const merge = require('../../../util/merge');

class SiteNameWidget extends Widget {
  async init(context, data) {
    await super.init(context, data);
    merge(this.data, {
      // TODO: Configurable.
      // TODO: Escape.
      content: 'Defiant',
      attributes: {
        class: ['brand-logo', 'left'],
      },
    });
  }
}

SiteNameWidget.id = 'Layout.SiteNameWidget';
// TODO: Translate.
SiteNameWidget.title = 'Site Name';
SiteNameWidget.description = 'Shows the name of the website and links to the front page.';
SiteNameWidget.templateFile = __dirname + '/../html/siteNameWidget.html';

module.exports = SiteNameWidget;
