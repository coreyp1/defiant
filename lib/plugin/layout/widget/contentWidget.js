"use strict";

const Widget = require('./widget');

class ContentWidget extends Widget {}

ContentWidget.id = 'Layout.ContentWidget';
// TODO: Translate.
ContentWidget.title = 'Page Contents';
ContentWidget.description = 'Contains the main contents of the requested page.';

module.exports = ContentWidget;
