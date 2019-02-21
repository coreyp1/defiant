"use strict";

const Widget = require('./widget');

class TitleWidget extends Widget {}

TitleWidget.Instance = require('./TitleWidgetInstance');
TitleWidget.id = 'Layout.TitleWidget';
// TODO: Translate.
TitleWidget.title = 'Page Title';
TitleWidget.description = 'Shows the title of the page.';
TitleWidget.templateFile = __dirname + '/../html/titleWidget.html';

module.exports = TitleWidget;
