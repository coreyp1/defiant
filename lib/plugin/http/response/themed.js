"use strict";

const Response = require('./response');

class Themed extends Response {
  constructor(context, data, statusCode=200) {
    super(context, data);
    this.statusCode = statusCode;
  }

  async commit(context) {
    // Set the layout.
    let data = this.data;
    let layoutData = await context.layout.init(context, {content: data.content});
    data.content = context.layout.commit(layoutData);

    // Render the page and send it to the user.
    let page = context.theme.getRenderable('Page');
    data = await page.init(context, data);

    // Include the Head CSS.
    data.head = data.head || "";
    for (let css of context.cssRegistry.getOrderedElements()) {
      if (css.data) {
        // Include inline CSS.
        data.head += `<style type="text/css">${css.data}</style>`;
      }
      else if (css.url) {
        // Include external CSS.
        data.head += `<link rel="stylesheet" type="text/css" href="${css.url}" />`;
      }
    }

    // Include the Head Javascript.
    for (let js of context.jsRegistry.getOrderedElements()) {
      if (js.data) {
        // Include inline JS.
        data.head += `<script type="text/javascript">${js.data}</script>`;
      }
      else if (js.url) {
        // Include external JS.
        data.head += `<script type="text/javascript" type="text/css" src="${js.url}"></script>`;
      }
    }

    // Include the Footer Javascript.
    data.jsFooter = data.jsFooter || "";
    for (let js of context.jsFooterRegistry.getOrderedElements()) {
      if (js.data) {
        // Include inline JS.
        data.jsFooter += `<script type="text/javascript">${js.data}</script>`;
      }
      else if (js.url) {
        // Include external JS.
        data.jsFooter += `<script type="text/javascript" type="text/css" src="${js.url}"></script>`;
      }
    }

    context.response.statusCode = this.statusCode;
    context.response.setHeader("Content-Type", 'text/html');
    context.response.write(page.commit(data));
    context.response.end();
  }
}

module.exports = Themed;
