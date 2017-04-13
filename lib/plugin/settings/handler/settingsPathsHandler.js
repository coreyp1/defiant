'use strict';

const AdminHandler = require('../../router/handler/adminHandler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class SettingsPathsHandler extends AdminHandler {
  init(context) {
    let form = new (context.engine.plugin.get('Fapi').getForm('SettingsPathsForm'))();
    let theme = context.theme;
    return co(function*(self, superInit) {
      yield superInit.call(self, context);
      yield form.init(context);
      context.httpResponse = new Themed(context, {
        language: 'us',
        siteName: 'Defiant',
        head: '',
        jsFooter: '',
        content: form.commit(),
      });
    })(this, super.init);
  }
}

SettingsPathsHandler.id = 'Settings.PathsHandler';
SettingsPathsHandler.path = 'admin/settings/paths';
// TODO: Translate
SettingsPathsHandler.menu = {
  menu: 'admin',
  text: 'Settings Paths',
  description: 'Change the directory where your settings are stored',
};

module.exports = SettingsPathsHandler;
