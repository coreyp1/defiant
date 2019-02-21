"use strict";

const Widget = require('../../layout/widget');
const merge = require('../../../util/merge');

class MessageWidget extends Widget {}

MessageWidget.Instance = require('./messageWidgetInstance');
MessageWidget.id = 'Message.MessageWidget';
// TODO: Translate.
MessageWidget.title = 'Message Box';
MessageWidget.description = 'This is where system messages will be shown to the user.';

module.exports = MessageWidget;
