"use strict";

const Plugin = require('../plugin');
const Renderable = require('../theme/renderable');

/**
 * The Message plugin provides an interface for other plugins to notify a user
 * in some way during a page request.
 *
 * Messages are usually set on the
 * [context.volatile.message]{@link Defiant.Context#volatile}
 * [Container]{@link Defiant.Plugin.Message.ContainerInstance}.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Message extends Plugin {
  /**
   * @function
   * @async
   * @param {Defiant.Plugin} plugin
   *   The Plugin to which the `action` pertains.
   * @param {String} action
   *   The action being performed.  Example actions include "pre-enable",
   *   "enable", "disable", "update".
   * @param {Mixed} [data=NULL]
   *   Any supplementary information.
   */
  async notify(plugin, action, data=null) {
    super.notify(plugin, action, data);
    switch (action) {
      case 'pre:enable':
        for (let existingPlugin of ['ThemeBase', 'Layout', 'Router'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // pre:enable

      case 'enable':
        switch ((plugin || {}).id) {
          case 'ThemeBase':
            // Add the Container renderable.
            plugin
              .setRenderable(new Renderable(this.engine, {
                id: 'Container',
                templateFile: __dirname + '/html/container.html',
                variables: ['attributes', 'content'],
                Instance: require('./renderable/containerInstance'),
              }))
              .setRenderable(require('./widget/messageWidget'));
            break; // ThemeBase

          case 'Layout':
            // Add the Message Widget.
            plugin.widgetRegistry.set(require('./widget/messageWidget'));
            break; // Layout

          case 'Router':
            // Add the MessageHandler to the Router.
            plugin.addHandler(new (require('./handler/messageHandler'))());
            break; // Router

          case this.id:
            break; // this.id
        }
        break; // enable

      case 'pre:disable':
        // @todo Cleanup entries in ThemeBase, Layout, and Router.
        break; // pre:disable
    }
  }
}

module.exports = Message;
