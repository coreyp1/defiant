"use strict";

const Widget = require('../../layout/widget');

/**
 * Provides a Widget for a specific menu.
 * @class
 * @extends Defiant.Plugin.Layout.Widget
 * @memberof Defiant.Plugin.Menu
 */
class MenuWidget extends Widget {
  /**
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @param {Object} [setup={}]
   *   The setup options.
   * @param {String} [setup.id]
   *   The unique identifier for this MenuWidget.
   * @param {String} [setup.title]
   *    A human-readable title of this menu widget.
   * @param {String} [setup.description]
   *   A description of this menu widget, for use in administrative
   *   interfaces.
   * @param {Boolean} [setup.showParentLinks]
   *   I don't remember what this is for...  Let's figure it out later.
   * @param {Number} [setup.maxLevels]
   *   The maximum number of levels to display.
   * @param {Object} [setup.overrides]
   *   Overridden values.
   * @param {Boolean} [setup.displayTitle]
   *   Whether or not to display the title.
   * @param {Object} [setup.attributes]
   *   Any additional attributes.
   * @param {Object} [setup.instanceSetup={}]
   *   Setup options which will be passed to the
   *   [RenderableInstance]{@link Defiant.Plugin.Theme.RenderableInstance} when
   *   it is instantiated.  See [Widget]{@link Defiant.Plugin.Layout.Widget} for
   *   more options.
   * @returns {Defiant.Plugin.Menu.MenuWidget}
   *   The instantiated MenuWidget.
   */
  constructor(engine, setup={}) {
    super(engine, setup);
    [
      /**
       * @member {String} Defiant.Plugin.Menu.MenuWidget#id
       *   The unique identifier for this MenuWidget.
       */
      'id',
      /**
       * @member {String} Defiant.Plugin.Menu.MenuWidget#title
       *   A human-readable title of this menu widget.
       */
      'title',
      /**
       * @member {String} Defiant.Plugin.Menu.MenuWidget#description
       *   A description of this menu widget, for use in administrative
       *   interfaces.
       */
      'description',
      /**
       * @todo Figure out what this was supposed to be for.
       * @member {Boolean} Defiant.Plugin.Menu.MenuWidget#showParentLinks
       *   I don't remember what this is for...  Let's figure it out later.
       */
      'showParentLinks',
      /**
       * @member {Number} Defiant.Plugin.Menu.MenuWidget#maxLevels
       *   The maximum number of levels to display.
       */
      'maxLevels',
      /**
       * @member {Object} Defiant.Plugin.Menu.MenuWidget#overrides
       *   Overridden values.
       */
      'overrides',
      /**
       * @member {Boolean} Defiant.Plugin.Menu.MenuWidget#displayTitle
       *   Whether or not to display the title.
       */
      'displayTitle',
      /**
       * @member {Object} Defiant.Plugin.Menu.MenuWidget#attributes
       *   Any additional attributes.
       */
      'attributes',
    ].map(v => this[v] = setup[v]);
    this.entries = [];
  }

  /**
   * Add a Handler to this Menu Widget.
   * @function
   * @param {Defiant.Plugin.Router.Handler} handler
   *   The Handler to be added to a Menu.
   */
  addHandler(handler) {
    let Router = this.engine.pluginRegistry.get('Router');
    this.entries.push({
      data: handler,
      handlers: Router.router.collectHandlers(handler.path).filter(handler => handler.menu || handler.allowShowLink),
    });
  }
}

MenuWidget.Instance = require('./menuWidgetInstance');
MenuWidget.templateFile = __dirname + '/../html/menuWidget.html';
module.exports = MenuWidget;
