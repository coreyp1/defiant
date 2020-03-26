"use strict";

const TagPair = require('../../theme/renderable/tagPair');

/**
 * Widgets are the building blocks of Layouts.  A plugin can provide a Widget,
 * which is then added to any layout using the Layout edit form.
 * @class
 * @extends Defiant.Plugin.Theme.TagPair
 * @memberOf Defiant.Plugin.Layout
 */
class Widget extends TagPair {
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
    super(engine, setup);
    this.instanceSetup.data.attributes.id.add(this.constructor.name);

    /**
     * @member {String} Defiant.Plugin.Layout.Widget#title
     *   The title of the Widget, for administrative display.
     */
    this.title = this.constructor.title;

    /**
     * @member {String} Defiant.Plugin.Layout.Widget#description
     *   The description of the Widget, for administrative display.
     */
    this.description = this.constructor.description;
  }
}

Widget.Instance = require('./widgetInstance');
Widget.id = ''; // Unique Identifier.
Widget.title = ''; // Used to identify the Widget to the Admin.
Widget.description = ''; // Additional information for use by the Admin.
Widget.templateFile = __dirname + '/../html/widget.html';
Widget.variables = [
  'attributes',
  'content'
];

module.exports = Widget;
