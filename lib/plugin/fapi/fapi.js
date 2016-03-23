"use strict";

const Plugin = require('../plugin');

class Fapi extends Plugin {
  constructor(engine) {
    super(engine);
    this.form = {};
    this.element = {};
    engine.plugin.get('Theme')
      .setRenderable(require('./renderable/tagSingle.js'))
      .setRenderable(require('./renderable/tagPair.js'))
    this
      .setElement(require('./element/button'))
  }

  setForm (formModule) {
    formModule.id = formModule.id || formModule.name;
    this.form[formModule.id] = formModule;
    return this;
  }

  getForm (id) {
    if (!this.form[id]) {
      throw 'Unregistered form: ' + id;
    }
    return this.form[id];
  }

  setElement (element) {
    element.id = element.id || element.name;
    this.element[element.id] = element;
    return this;
  }

  getElement (id) {
    if (!this.element[id]) {
      throw 'Unregistered form element: ' + id;
    }
    return this.element[id];
  }
}

module.exports = Fapi;
