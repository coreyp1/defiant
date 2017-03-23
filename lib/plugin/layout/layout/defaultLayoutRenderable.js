"use strict";

const LayoutRenderable = require('./layoutRenderable');

class DefaultLayoutRenderable extends LayoutRenderable {}

DefaultLayoutRenderable.id = 'defaultLayout';
DefaultLayoutRenderable.templateContents = `<%= content %>`;
DefaultLayoutRenderable.variables = ['content'];
DefaultLayoutRenderable.regions = {
  content: [
    'Message.MessageWidget',
    'Layout.ContentWidget',
  ],
};

module.exports = DefaultLayoutRenderable;
