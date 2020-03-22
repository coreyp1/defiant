"use strict";

const ThemeBasePage = require('../../themeBase/renderable/page');

/**
 * Simple page that adds the Bootstrap CSS and JavaScript.
 * @todo I don't think that this has been refactored yet.  The init() should be
 *   in an Instance class!
 * @class
 * @extends Defiant.Plugin.ThemeBase.Page
 * @memberOf Defiant.Plugin
 */
class Page extends ThemeBasePage {
  async init(context, data={}) {
    // Add the default CSS & Javascript Files.
    context.engine.library.require(context, 'Bootstrap');

    return await super.init(context, data);
  }
}

Page.templateFile = __dirname + '/../html/page.html';

module.exports = Page;
