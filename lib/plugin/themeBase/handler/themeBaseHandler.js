"use strict";

const Handler = require('../../router/handler');
const Registry = require('../../../util/registry');
const {coroutine: co} = require('bluebird');
const path = require('path');

class ThemeBaseHandler extends Handler {
  init(context) {
    return co(function*(self, superInit){
      superInit.call(self, context);

      // Create the CSS & Javascript registries.
      context.css = new Registry();
      context.js = new Registry();
      context.jsFooter = new Registry();
      
      // Add the default CSS & Javascript Files.
      context.css.set({
        id: 'themeBase',
        url: '/file/theme/themeBase/css/style.css',
        path: path.join(__dirname, '../file/css/style.css'),
        noCompress: false,
      });

      /*
      // Example setting Internal CSS.
      context.css.set({
        id: 'themeBaseInline',
        data: '',
      });
      */

      context.js.set({
        id: 'themeBase',
        url: '/file/theme/themeBase/js/themeBase.js',
        path: path.join(__dirname, '../file/js/themeBase.js'),
        noCompress: false,
      });

      /*
      // Example setting Internal JavaScript.
      context.js.set({
        id: 'themeBaseInline',
        data: '',
      });
      */
    })(this, super.init);
  }
}

ThemeBaseHandler.id = 'ThemeBase.ThemeBaseHandler';
ThemeBaseHandler.path = '';
ThemeBaseHandler.weight = -500;

module.exports = ThemeBaseHandler;