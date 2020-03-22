"use strict";

const Renderable = require('./renderable');
const merge = require('../../../util/merge');

/**
 * TagSingle is the most basic Renderable class that does something interesting.
 * It provides for a single HTML tag with support for the tag type and its
 * attributes.
 * @class
 * @extends Defiant.Plugin.Theme.Renderable
 * @memberOf Defiant.Plugin.Theme
 */
class TagSingle extends Renderable {
  /**
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Object} [setup={}]
   *   The setup options.
   * @param {Object} [setup.instanceSetup={}]
   *   Setup options which will be passed to the
   *   [RenderableInstance]{@link Defiant.Plugin.Theme.RenderableInstance} when
   *   it is instantiated.
   * @param {Object} [setup.instanceSetup.data={}]
   *   The `data` object.
   * @param {Object} [setup.instanceSetup.data.attributes={}]
   *   Attributes that will appear in the tag.
   * @param {Object} [setup.instanceSetup.data.attributes.id=Set<String>]
   *   Ids that will appear in the tag.
   * @param {Object} [setup.instanceSetup.data.attributes.class=Set<String>]
   *   Classes that will appear in the tag.
   * @returns {Defiant.Plugin.Theme.Renderable}
   *   The instantiated Renderable.
   */
  constructor(engine, setup={}) {
    super(engine, merge({
      instanceSetup: {
        data: {
          attributes: {
            id: new Set(),
            class: new Set(),
          },
        },
      },
    }, setup));
  }

  /**
   * Helper function used to convert the `attributes` provided in the `data`
   * object (e.g., "id" and "class", or any others provided) into something
   * useful.
   *
   * Sets and arrays will become a single string of space-separated values.
   * Strings pass through.
   * @todo Should the resultant strings be escaped?
   * @function
   * @static
   * @param {Object} attributes
   *   The attributes as key/value pairs, where the key is the name of the
   *   attribute.
   * @returns {String}
   *   All of the attributes and their corresponding values concatenated into a
   *   single string.
   */
  static parseAttributes(attributes) {
    return (typeof attributes == 'object')
      ? Object.keys(attributes).map(name => attributes[name] == undefined
        ? name
        : `${name}="${Array.isArray(attributes[name])
            ? attributes[name].join(' ')
            : (attributes[name] instanceof Set
              ? Array.from(attributes[name]).join(' ')
              : attributes[name])
            }"`).join(' ')
      : attributes;
  }
}

TagSingle.templateFile = __dirname + '/../html/tagSingle.html';
/**
 * @typedef Defiant.Plugin.Theme.TagSingle.Variables
 * @prop {String} tag
 *   The tag for the HTML.
 * @prop {Object} attributes
 *   The attributes of the tag as key/value pairs.  The value may be a Set.
 * @prop {boolean} selfClosing
 *   Whether or not the tag should be rendered as self-closing.
 */
/**
 * @member {Defiant.Plugin.Theme.TagSingle.Variables} Defiant.Plugin.Theme.TagSingle#variables
 *   The variables that are expected by the render function.
 *
 *   Note: The `variable` value on the object itself is actually an array of
 *   strings, but are presented as a special type in this documentation so that
 *   the variables can have a description and associated type, which is what is
 *   needed when passed into `templateFunction()`.
 */
TagSingle.variables = [
  'tag',
  'attributes',
  'selfClosing',
];
// This boilerplate is an adaptation of TagSingle.parseAttributes() above.
TagSingle.boilerplate = `function ${TagSingle.parseAttributes.toString()}; attributes = parseAttributes(attributes);`;

module.exports = TagSingle;
