"use strict";

class Renderable {
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
