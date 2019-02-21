"use strict";

class Renderable {
  constructor(engine, data={}) {
    this.parent = undefined;
    this.engine = engine;
    this.data = data.data || {};
    ['id', 'name', 'templateFile', 'variables'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
    if (this.id == undefined) {
      this.id = this.constructor.name;
    }
  }

  newInstance(context) {
    return new (this.Instance || this.constructor.Instance)(this, this.data, context);
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
