"use strict";

const Plugin = require('../plugin');
const Data = require('../settings/data');
const Registry = require('../../util/registry');
const Path = require('path');
const {coroutine: co, promisify} = require('bluebird');

class Layout extends Plugin {
  constructor(engine) {
    super(engine);

    // Create the Layouts Registry.
    this.layouts = new Registry();
    this.layouts.set(require('./layout/defaultLayoutRenderable'));

    // Create the Widgets Registry.
    this.widgets = new Registry();
    this.widgets.set(require('./widget/contentWidget'));

    // Add the layout Handler.
    // TODO: Move to init() and use a separate handler for each path.
    engine.plugin.get('Router').router
      .addHandler(require('./handler/layoutHandler'));
  }

  init() {
    return co(function*(self){
      // Add layout settings files.
      let Settings = self.engine.plugin.get('Settings');
      for (let layout of self.layouts.getIterator()) {
        Settings.cache.set(new Data({
          id: `layout/${layout.id}.json`,
          filename: Path.join('layout', `${layout.id}.json`),
          storage: 'settings',
          storageCanChange: true,
          description: 'This stores the overrides of the layout class, which are set through the administrative interface.',
          default: {
            templateContents: layout.templateContents,
            paths: layout.paths,
            regions: layout.regions,
          },
        }));
      }
    })(this);
  }
}

module.exports = Layout;