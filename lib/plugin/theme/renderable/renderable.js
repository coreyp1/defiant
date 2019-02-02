"use strict";

const merge = require('../../../util/merge');

class Renderable {
  constructor(engine, data={}) {
    this.parent = undefined;
    this.engine = engine;
    this.data = data || {};
    ['id', 'name', 'templateFile', 'variables'].map(key => this[key] = data[key] ? data[key] : this.constructor[key]);
    if (this.id == undefined) {
      this.id = this.constructor.name;
    }
  }

  commit(data) {
    return this.templateFunction(data);
  }

  templateFunction(data) {
    // TODO: templateFunction should be the function itself, not just a wrapper.
    return this.constructor.templateFunction(data);
  }

  getTopmostParent() {
    return this.parent ? this.parent.getTopmostParent() : this;
  }

  async init(context, data={}) {
    return merge(JSON.parse(JSON.stringify(this.data)), data);
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

module.exports = Renderable;
