"use strict";

const clone = require('clone');
const merge = require('../../../util/merge');

class Renderable {
  constructor(engine, setup={}) {
    this.parent = undefined;
    this.engine = engine;
    this.instanceSetup = setup.instanceSetup || {};
    ['id', 'name', 'templateFile', 'variables'].map(key => this[key] = setup[key] ? setup[key] : this.constructor[key]);
    if (this.id == undefined) {
      this.id = this.constructor.name;
    }
  }

  newInstance(context, setup={}) {
    return new (this.Instance || this.constructor.Instance)(this, merge(clone(this.instanceSetup), setup), context);
  }

  templateFunction(data) {
    // TODO: templateFunction should be the function itself, not just a wrapper.
    return this.constructor.templateFunction(data);
  }

  getTopmostParent() {
    return this.parent ? this.parent.getTopmostParent() : this;
  }

  static compileTemplate(variables, code, boilerplate) {
    code = ('%>' + code + '<%')
      .replace(/(<%=)(([^%]|%(?!>))*)(%>)/g, (...args) => `<% templateOut += (${args[2]});\n%>`)
      .replace(/(%>)(([^<]|<(?!%))*)(<%)/g, (...args) => `templateOut += ${JSON.stringify(args[2])};\n`);
    boilerplate = boilerplate || '';
    return new Function(`"use strict";
      return function({${variables.join()}}) {
        let templateOut = '';
        ${boilerplate}
        ${code}
        return templateOut;
      };`)();
  }
}

Renderable.Instance = require('./renderableInstance');

module.exports = Renderable;
