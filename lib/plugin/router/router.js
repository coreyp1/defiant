"use strict";

const Item = require('./item');
const Plugin = require('../plugin');
const Registry = require('../../util/registry');

/**
 * The Router plugin is the machinery that allows other plugins to respond to
 * page load requests.
 *
 * Plugins can register [handlers]{@link Defiant.Plugin.Router.Handler} which
 * can respond to a page load request in a variety of ways, either augmenting or
 * changing a previous handler's actions.
 *
 * Handlers are registered by the
 * [Router.addHandler()]{@link Defiant.Plugin.Router#addHandler} function.
 * @class
 * @extends Defiant.Plugin
 * @memberOf Defiant.Plugin
 */
class Router extends Plugin {
  /**
   * Initializes the [Account]{@link Defiant.Plugin.Account} permission and
   * adds handlers for 403 and 404 responses.
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
        /**
         * @member {Defiant.Plugin.Router.Item} Defiant.Plugin.Router#router
         *   Base router item.
         */
        this.router = new Item();

        /**
         * @todo Convert handlerRegistry to an InitRegistry.
         * @member {Defiant.util.Registry} Defiant.Plugin.Router#handlerRegistry
         *   Registry of existing Handlers.
         */
        this.handlerRegistry = new Registry();

        this
          .addHandler(new (require('./handler/accessDeniedHandler'))())
          .addHandler(new (require('./handler/notFoundHandler'))());

        for (let existingPlugin of ['Http', 'Account', 'Menu'].map(name => this.engine.pluginRegistry.get(name))) {
          if (existingPlugin instanceof Plugin) {
            await this.notify(existingPlugin, 'enable');
          }
        }
        break; // 'pre-enable'

      case 'enable':
        switch ((plugin || {}).id) {
          case 'Http':
            plugin
              .incomingRegistry.set({
                id: 'router',
                incoming: (...args) => this.incoming(...args),
              });
            break;

          case 'Account':
            plugin.permission[".admin"] = {
              title: 'Admin Pages',
              description: 'Access general administration pages',
            };
            break; // 'Account'

          case 'Menu':
            for (let handler of this.handlerRegistry.getOrderedElements()) {
              plugin.addHandler(handler);
            }
            break;
        }
        break; // 'enable'

      case 'pre:disable':
        // @todo: Remove integration from Http, Menu.
        break; // pre:disable
    }
  }

  /**
   * @function
   * @param {Defiant.Plugin.Router.Handler} handler
   *   Add a handler to the router.
   *
   *   The handler will also be added to the [menu]{Defiant.Plugin.Menu} system.
   * @returns {Defiant.Plugin.Router}
   *   The app router.
   */
  addHandler(handler) {
    this.router.addHandler(handler);
    this.handlerRegistry.set(handler);

    // If the Menu plugin is activated later, then all of the handlers will be
    // added to it by the Router.notify() method.
    let Menu = this.engine.pluginRegistry.get('Menu');
    if (Menu instanceof Plugin) {
      Menu.addHandler(handler);
    }
    return this;
  }

  /**
   * Accept an incoming request context and give it to the handlers in their
   * priority sorted order.
   * @todo Proper favicon.ico handling.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async incoming(context) {
    // Tokenize the URL.
    context.request.urlTokenized = context.request._parsedUrl.pathname.split('/').map(path => path.trim()).filter(path => path !== '');

    // The following line of code should be ripped out with extreme prejudice
    // once proper favicon.ico handling is written.
    if (context.request.urlTokenized.length == 1 && context.request.urlTokenized[0] == 'favicon.ico') {return;}

    // Get all handlers that match the request URL, sorted.
    let handlers = Item.sortHandlers(this.router.collectHandlers(context.request.urlTokenized));

    // Iterate through the handlers and process them if necessary.
    for (let key in handlers) {
      if (context.httpResponse === undefined || handlers[key].alwaysProcess) {
        if (await handlers[key].allowAccess(context)) {
          // Set the page title.
          if (handlers[key].menu && handlers[key].menu.text) {
            context.page.title = handlers[key].menu.text;
          }
          // Process the handler.
          await handlers[key].init(context);
        }
      }
    }
  }
}

module.exports = Router;
