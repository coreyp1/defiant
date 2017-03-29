"use strict";

const Response = require('./response');
const {coroutine:co} = require('bluebird');

class Themed extends Response {
  commit() {
    return co(function*(self){
      // Set the layout.
      let layout = new(self.context.layout)({content: self.data.content});
      yield layout.init(self.context);
      self.data.content = layout.commit();

      // Include the Head CSS.
      self.data.head = self.data.head || "";
      for (let css of self.context.css.getOrderedElements()) {
        if (css.data) {
          // Include inline CSS.
          self.data.head += `<style type="text/css">${css.data}</style>`;
        }
        else if (css.url) {
          // Include external CSS.
          self.data.head += `<link rel="stylesheet" type="text/css" href="${css.url}" />`;
        }
      }

      // Include the Head Javascript.
      for (let js of self.context.js.getOrderedElements()) {
        if (js.data) {
          // Include inline JS.
          self.data.head += `<script type="text/javascript">${js.data}</script>`;
        }
        else if (js.url) {
          // Include external JS.
          self.data.head += `<script type="text/javascript" type="text/css" src="${js.url}"></script>`;
        }
      }

      // Include the Footer Javascript.
      self.data.jsFooter = self.data.jsFooter || "";
      for (let js of self.context.jsFooter.getOrderedElements()) {
        if (js.data) {
          // Include inline JS.
          self.data.jsFooter += `<script type="text/javascript">${js.data}</script>`;
        }
        else if (js.url) {
          // Include external JS.
          self.data.jsFooter += `<script type="text/javascript" type="text/css" src="${js.url}"></script>`;
        }
      }

      // Render the page and send it to the user.
      let renderable = new (self.context.theme.getRenderable('Page'))(self.data);
      self.context.response.setHeader("Content-Type", 'text/html');
      self.context.response.write(renderable.templateFunction());
      self.context.response.end();
    })(this);
  }
}

module.exports = Themed;
