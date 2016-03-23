"use strict";

const {coroutine: co} = require('bluebird');

class Renderable {
  constructor() {
    this.parent = undefined;
  }

  commit() {
    return this.templateFunction(this.data);
  }

  templateFunction(...args) {
    return this.constructor.templateFunction(...args);
  }

  getTopmostParent() {
    return this.parent ? this.parent.getTopmostParent() : this;
  }

  init(context, data) {
    this.context = context;
    this.data = data;
    return co(function*() {})();
  }

  static compileTemplate (variables, code, boilerplate) {
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
