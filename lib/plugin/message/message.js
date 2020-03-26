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
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin.Message}
   *   The Message plugin that was instantiated.
   */
  constructor(engine) {
    super(engine);

    // Add the Container renderable.
    engine.pluginRegistry.get('ThemeBase')
      .setRenderable(new Renderable(engine, {
        id: 'Container',
        templateFile: __dirname + '/html/container.html',
        variables: ['attributes', 'content'],
        Instance: require('./renderable/containerInstance'),
      }))
      .setRenderable(require('./widget/messageWidget'));

    // Add the Message Widget.
    engine.pluginRegistry.get('Layout').widgetRegistry.set(new (require('./widget/messageWidget'))());

    // Add the MessageHandler to the Router.
    engine.pluginRegistry.get('Router').addHandler(new (require('./handler/messageHandler'))());
  }
}

module.exports = Message;
