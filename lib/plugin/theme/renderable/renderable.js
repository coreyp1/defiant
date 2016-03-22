"use strict";

class Renderable {
  constructor() {
    this.id = this.constructor.name;
  }

  static compileTemplate (variables, code) {
    code = ('%>' + code + '<%')
      .replace(/(<%=)(([^%]|%(?!>))*)(%>)/g, function() {
        return `<% templateOut += (${arguments[2]});\n%>`
      })
      .replace(/(%>)(([^<]|<(?!%))*)(<%)/g, function() {
        return `templateOut += ${JSON.stringify(arguments[2])};\n`;
      });
    code = `"use strict";
      return function({${variables.join()}}) {
        let templateOut = '';
        ${code}
        return templateOut;
      };`;
    return new Function(code)();
  }
}

module.exports = Renderable;
