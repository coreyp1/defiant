"use strict";

const Widget = require('./widget');
const merge = require('../../../util/merge');

class SiteNameWidget extends Widget {}

SiteNameWidget.Instance = require('./siteNameWidgetInstance');
SiteNameWidget.id = 'Layout.SiteNameWidget';
// TODO: Translate.
SiteNameWidget.title = 'Site Name';
SiteNameWidget.description = 'Shows the name of the website and links to the front page.';
SiteNameWidget.templateFile = __dirname + '/../html/siteNameWidget.html';

module.exports = SiteNameWidget;
