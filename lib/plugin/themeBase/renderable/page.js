"use strict";

const Renderable = require('../../theme/renderable');

/**
 * Renderable for a basic HTML page.
 * @class
 * @extends Defiant.Plugin.Theme.Renderable
 * @memberOf Defiant.Plugin.ThemeBase
 */
class Page extends Renderable {}

Page.Instance = require('./pageInstance');
Page.templateFile = __dirname + '/../html/page.html';
/**
 * @typedef Defiant.Plugin.ThemeBase.Page.Variables
 * @prop {String} language
 *   The language code.
 * @prop {String} siteName
 *   The name of the site to appear in the title bar.
 * @prop {String} head
 *   The page header.
 * @prop {String} jsFooter
 *   The JavaScript to appear in the footer.
 * @prop {String} content
 *   The main page content.
 */
/**
 * @member {Defiant.Plugin.ThemeBase.Page.Variables} Defiant.Plugin.ThemeBase.Page#variables
 *   The variables that are expected by the render function.
 *
 *   Note: The `variable` value on the object itself is actually an array of
 *   strings, but are presented as a special type in this documentation so that
 *   the variables can have a description and associated type, which is what is
 *   needed when passed into `templateFunction()`.
 */
Page.variables = [
  'language',
  'siteName',
  'head',
  'jsFooter',
  'content',
];

module.exports = Page;
