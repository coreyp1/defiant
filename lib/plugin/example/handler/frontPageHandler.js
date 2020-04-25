"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');

/**
 * Example of providing a front page to the website.
 * @class
 * @extends Defiant.Plugin.Router.Handler
 * @memberOf Defiant.Plugin.Example
 */
class FrontPageHandler extends Handler {
  /**
   * Determine whether or not this handler will allow access to the url in
   * [context.request]{@link Defiant.Context#request}.  May also set
   * [context.httpResponse]{@link Defiant.Context#httpResponse}.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   **/
  async allowAccess(context) {
    if (await super.allowAccess(context)) {
      return context.request._parsedUrl.pathname === '/';
    }
    return false;
  }

  /**
   * A request has been made.  Provide the front page text.
   * @function
   * @async
   * @param {Defiant.Context} context
   *   The request context.
   */
  async init(context) {
    // TODO: Translate.
    context.page.title = 'Welcome to Defiant!';

    let content = '';
    if (context.account && context.account.id) {
      content += `<p>You are logged in as ${context.account.username[0].value}</p>`;
      content += `<p><a href="/password">Change your password</a></p>`;
      content += `<p><a href="/logout">Logout</a></p>`;
    }
    else {
      content += `<p>You are not logged in.</p>`;
      content += `<p><a href="/login">Login</a></p>`;
    }
    content += `<p>Pages from the Example plugin:</p>
      <ul>
        <li><a href="/example.json">JSON output</a></li>
        <li><a href="/example.text">Plain text output</a></li>
        <li><a href="/example.themed">Themed text output</a> (Page contents are wrapped in the site theme.)</li>
        <li><a href="/example.formApi">FormApi Demo</a> (Demonstration of the Form elements available through the Form API.  It's ugly, but it's just meant to show what can be done.)</li>
        <li><a href="/example.directory">Directory & File serving</a> (Demonstrating the ability to map specific paths to directories and serve files from them.)</li>
        <li><a href="/example.file/static.txt">Individual File serving</a> (Demonstrating that a single file can be served explicitly, without exposing other files in the same directory.)</li>
        <li><a href="/example.admin">Admin</a> (Simple Admin pages directory.)</li>
      </ul>`;
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: content,
    });
  }
}

FrontPageHandler.id = 'Example.FrontPageHandler';
FrontPageHandler.path = '';
// TODO: Translate
FrontPageHandler.menu = {
  menu: 'default',
  text: 'Home',
  description: 'Home',
};

module.exports = FrontPageHandler;
