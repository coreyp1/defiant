"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class FrontPageHandler extends Handler {
  init(context) {
    return co(function*() {
      let content = '<h2>Welcome to Defiant!</h2>';
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
          <li><a href="/example.fapi">FAPI Demo</a> (Demonstration of the Form elements available through the Form API.  It's ugly, but it's just meant to show what can be done.)</li>
          <li><a href="/example.directory">Directory & File serving</a> (Demonstrating the ability to map specific paths to directories and serve files from them.)</li>
        </ul>`;
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: content,
      });
    })();
  }
}

FrontPageHandler.id = 'Example.FrontPageHandler';
FrontPageHandler.path = '';

module.exports = FrontPageHandler;
