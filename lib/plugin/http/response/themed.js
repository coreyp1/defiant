"use strict";

const Response = require('./response');
const {coroutine:co} = require('bluebird');

class Themed extends Response {
  constructor(context, data, statusCode=200) {
    super(context, data);
    this.statusCode = statusCode;
  }

  async commit() {
    // Set the layout.
    await this.context.layout.init(this.context, {content: this.data.content});
    this.data.content = this.context.layout.commit();

    // Render the page and send it to the user.
    let renderable = new (this.context.theme.getRenderable('Page'))(this.data);
    await renderable.init(this.context);

    // Include the Head CSS.
    this.data.head = this.data.head || "";
    for (let css of this.context.cssRegistry.getOrderedElements()) {
      if (css.data) {
        // Include inline CSS.
        this.data.head += `<style type="text/css">${css.data}</style>`;
      }
      else if (css.url) {
        // Include external CSS.
        this.data.head += `<link rel="stylesheet" type="text/css" href="${css.url}" />`;
      }
    }

    // Include the Head Javascript.
    for (let js of this.context.jsRegistry.getOrderedElements()) {
      if (js.data) {
        // Include inline JS.
        this.data.head += `<script type="text/javascript">${js.data}</script>`;
      }
      else if (js.url) {
        // Include external JS.
        this.data.head += `<script type="text/javascript" type="text/css" src="${js.url}"></script>`;
      }
    }

    // Include the Footer Javascript.
    this.data.jsFooter = this.data.jsFooter || "";
    for (let js of this.context.jsFooterRegistry.getOrderedElements()) {
      if (js.data) {
        // Include inline JS.
        this.data.jsFooter += `<script type="text/javascript">${js.data}</script>`;
      }
      else if (js.url) {
        // Include external JS.
        this.data.jsFooter += `<script type="text/javascript" type="text/css" src="${js.url}"></script>`;
      }
    }

    this.context.response.statusCode = this.statusCode;
    this.context.response.setHeader("Content-Type", 'text/html');
    this.context.response.write(renderable.templateFunction());
    this.context.response.end();
  }
}

module.exports = Themed;
