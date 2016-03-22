"use strict";

class Renderable {
  constructor(context) {
    this.context = context;
  }

  templateFunction(...args) {
    return this.constructor.templateFunction(...args);
  }

  static compileTemplate (variables, code) {
    code = ('%>' + code + '<%')
      .replace(/(<%=)(([^%]|%(?!>))*)(%>)/g, function() {
        return `<% templateOut += (${arguments[2]});\n%>`
      })
      .replace(/(%>)(([^<]|<(?!%))*)(<%)/g, function() {
        return `templateOut += ${JSON.stringify(arguments[2])};\n`;
      });
    return new Function(`"use strict";
      return function({${variables.join()}}) {
        let templateOut = '';
        ${code}
        return templateOut;
      };`)();
  }
}

module.exports = Renderable;
