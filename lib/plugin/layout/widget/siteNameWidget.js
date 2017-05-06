"use strict";

const Widget = require('./widget');
const merge = require('../../../util/merge');
const {coroutine: co} = require('bluebird');

class SiteNameWidget extends Widget {
  init(context, data) {
    return co(function*(self, superInit){
      yield superInit.call(self, context, data);
      merge(self.data, {
        // TODO: Configurable.
        // TODO: Escape.
        content: 'Defiant',
        attributes: {
          class: ['brand-logo', 'left'],
        },
      });
    })(this, super.init);
  }
}

SiteNameWidget.id = 'Layout.SiteNameWidget';
// TODO: Translate.
SiteNameWidget.title = 'Site Name';
SiteNameWidget.description = 'Shows the name of the website and links to the front page.';
SiteNameWidget.templateFile = __dirname + '/../html/siteNameWidget.html';

module.exports = SiteNameWidget;
