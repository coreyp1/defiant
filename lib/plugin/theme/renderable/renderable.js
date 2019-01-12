"use strict";

const merge = require('../../../util/merge');

class Renderable {
  constructor(data) {
    this.parent = undefined;
    this.data = data || {};
    this.id = (data && data.id) ? data.id : this.constructor.id;
    this.name = (data && data.name) ? data.name : this.constructor.name;
    this.templateFile = this.constructor.templateFile;
    this.variables = this.constructor.variables;
  }

  commit() {
    return this.templateFunction(this.data);
  }

  templateFunction() {
    return this.constructor.templateFunction(this.data);
  }

  getTopmostParent() {
    return this.parent ? this.parent.getTopmostParent() : this;
  }

  async init(context, data={}) {
    this.context = context;
    this.data = merge(this.data, data);
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
