"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class AdminHandler extends Handler {
  init(context) {
    return co(function*() {
      let content = '';
      let paths = {
        'Settings.PathsHandler': 'admin/settings/paths',
        'Settings.ClassMapHandler': 'admin/settings/class_map',
      }
      Object.keys(paths).map(key => {
        content += `<a href="/${paths[key]}">${key}</a><br />`;
      });
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

AdminHandler.id = 'Example.AdminHandler';
AdminHandler.path = 'example.admin';

module.exports = AdminHandler;
