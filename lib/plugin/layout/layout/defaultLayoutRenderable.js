"use strict";

const LayoutRenderable = require('./layoutRenderable');

class DefaultLayoutRenderable extends LayoutRenderable {}

DefaultLayoutRenderable.id = 'defaultLayout';
DefaultLayoutRenderable.templateContents = `<nav><%= navigation %></nav>
<%= content %>`;
DefaultLayoutRenderable.variables = ['navigation', 'content'];
DefaultLayoutRenderable.paths = [''];
DefaultLayoutRenderable.regions = {
  content: [
    'Menu.default',
    'Message.MessageWidget',
    'Layout.ContentWidget',
    'Menu.admin',
  ],
};

module.exports = DefaultLayoutRenderable;
