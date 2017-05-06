"use strict";

const LayoutRenderable = require('./layoutRenderable');

class DefaultLayoutRenderable extends LayoutRenderable {}

DefaultLayoutRenderable.id = 'defaultLayout';
DefaultLayoutRenderable.templateContents = `<nav><%= navigation %></nav>
<div class="row">
  <div class="col s12">
    <%= content %>
  </div>
</div>
<div class="divider"></div>
<div class="row">
  <footer class="col s12">
    <%= footer %>
  </footer>
</div>`;
DefaultLayoutRenderable.variables = ['navigation', 'content', 'footer'];
DefaultLayoutRenderable.paths = [''];
DefaultLayoutRenderable.regions = {
  navigation: [
    'Menu.default',
  ],
  content: [
    'Layout.TitleWidget',
    'Message.MessageWidget',
    'Layout.ContentWidget',
  ],
  footer: [
    'Menu.admin',
  ],
};

module.exports = DefaultLayoutRenderable;
