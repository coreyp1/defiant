'use strict';

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class ThemedHandler extends Handler {
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

ThemedHandler.id = 'Settings.SettingsPaths';
ThemedHandler.path = 'admin/settings/paths';

module.exports = ThemedHandler;
