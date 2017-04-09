"use strict";

const AdminHandler = require('../../router/adminHandler');
const Themed = require('../../http/response/themed');
const {coroutine: co} = require('bluebird');

class ClassMapHandler extends AdminHandler {
  init(context) {
    let form = new (context.engine.plugin.get('Fapi').getForm('SettingsClassMapForm'))();
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

ClassMapHandler.id = 'Settings.ClassMapHandler';
ClassMapHandler.path = 'admin/settings/class_map';

module.exports = ClassMapHandler;
