"use strict";

const Response = require('./response');

/**
 * Class for sending a themed response to a http request.
 * @class
 * @extends Defiant.Plugin.Http.Response
 * @memberOf Defiant.Plugin.Http.Response
 */
class Themed extends Response {
  /**
   * @constructor
   * @param {Defiant.Context} context The request context.
   * @param {Object} data Data for the theme request.
   * @param {number} [statusCode=200] The http status code.
   */
  constructor(context, data, statusCode=200) {
    super(context, data);
    /**
     * @member {number} Defiant.Plugin.Http.Response.Themed#statusCode
     *   The http status code.
     */
    this.statusCode = statusCode;
  }

  /**
   * Generate the themed output for the http request.
   * @function
   * @async
   * @param {Defiant.Context} The request context.
   */
  async commit(context) {
    // Set the layout.
    let data = this.data;
    let layoutInstance = context.layout.newInstance(context);
    await layoutInstance.init({content: data.content});
    data.content = await layoutInstance.commit();

    // Render the page and send it to the user.
    let Page = context.theme.getRenderable('Page');
    let pageInstance = Page.newInstance(context);
    await pageInstance.init(data);

    // Include the Head CSS.
    pageInstance.data.head = pageInstance.data.head || "";
    for (let css of context.cssRegistry.getOrderedElements()) {
      if (css.data) {
        // Include inline CSS.
        pageInstance.data.head += `<style type="text/css">${css.data}</style>`;
      }
      else if (css.url) {
        // Include external CSS.
        pageInstance.data.head += `<link rel="stylesheet" type="text/css" href="${css.url}" />`;
      }
    }

    // Include the Head Javascript.
    for (let js of context.jsRegistry.getOrderedElements()) {
      if (js.data) {
        // Include inline JS.
        pageInstance.data.head += `<script type="text/javascript">${js.data}</script>`;
      }
      else if (js.url) {
        // Include external JS.
        pageInstance.data.head += `<script type="text/javascript" type="text/css" src="${js.url}"></script>`;
      }
    }

    // Include the Footer Javascript.
    pageInstance.data.jsFooter = pageInstance.data.jsFooter || "";
    for (let js of context.jsFooterRegistry.getOrderedElements()) {
      if (js.data) {
        // Include inline JS.
        pageInstance.data.jsFooter += `<script type="text/javascript">${js.data}</script>`;
      }
      else if (js.url) {
        // Include external JS.
        pageInstance.data.jsFooter += `<script type="text/javascript" type="text/css" src="${js.url}"></script>`;
      }
    }

    context.response.statusCode = this.statusCode;
    context.response.setHeader("Content-Type", 'text/html');
    context.response.write(await pageInstance.commit());
    context.response.end();
  }
}

module.exports = Themed;
