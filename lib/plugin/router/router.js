"use strict";

const Item = require('./item');
const Plugin = require('../plugin');

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
   * @constructor
   * @param {Defiant.Engine} engine
   *   The app engine.
   * @returns {Defiant.Plugin.Router}
   *   The app router.
   */
  constructor(engine) {
    super(engine);
    engine.pluginRegistry.get('Http').incomingRegistry.set({id: 'router', incoming: (...args) => this.incoming(...args)});
    /**
     * @member {Defiant.Plugin.Router.Item} Defiant.Plugin.Router#router
     *   Base router item.
     */
    this.router = new Item();
    return this;
  }

  /**
   * Initializes the [Account]{@link Defiant.Plugin.Account} permission and
   * adds handlers for 403 and 404 responses.
   * @function
   * @async
   */
  async init() {
    const Account = this.engine.pluginRegistry.get('Account');
    Account.permission[".admin"] = {
      title: 'Admin Pages',
      description: 'Access general administration pages',
    };

    this.addHandler(new (require('./handler/accessDeniedHandler'))())
      .addHandler(new (require('./handler/notFoundHandler'))());
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
    let Menu = this.engine.pluginRegistry.get('Menu');
    Menu.addHandler(handler);
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
