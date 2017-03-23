"use strict";

const {coroutine: co} = require('bluebird');

class Renderable {
  constructor(data={}) {
    this.parent = undefined;
    this.data = data;
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

  init(context) {
    this.context = context;
    return co(function*(){})();
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
