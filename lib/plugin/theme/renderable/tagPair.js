"use strict";

const TagSingle = require('./tagSingle');

/**
 * TagPair extends TagSingle by providing HTML tags that wrap some content.
 * @class
 * @extends Defiant.Plugin.Theme.TagSingle
 * @memberOf Defiant.Plugin.Theme
 */
class TagPair extends TagSingle {}

TagPair.templateFile = __dirname + '/../html/tagPair.html';
/**
 * @typedef Defiant.Plugin.Theme.TagPair.Variables
 * @prop {String} tag
 *   The tag for the HTML.
 * @prop {Object} attributes
 *   The attributes of the tag as key/value pairs.  The value may be a Set.
 * @prop {String} content
 *   The content to be wrapped by the HTML tags.  No escaping takes place here.
 */
/**
 * @member {Defiant.Plugin.Theme.TagPair.Variables} Defiant.Plugin.Theme.TagPair#variables
 *   The variables that are expected by the render function.
 *
 *   Note: The `variable` value on the object itself is actually an array of
 *   strings, but are presented as a special type in this documentation so that
 *   the variables can have a description and associated type, which is what is
 *   needed when passed into `templateFunction()`.
 */
TagPair.variables = [
  'tag',
  'attributes',
  'content',
];

module.exports = TagPair;
