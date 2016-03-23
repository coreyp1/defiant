"use strict";

const Renderable = require('../../theme/renderable/renderable');

class TagSingle extends Renderable {
  parseAttributes(attributes) {
    return (typeof attributes == 'object') ? Object.keys(attributes).map(name => attributes[name] == undefined ? name : `${name}="${attributes[name]}"`).join(' ') : attributes;
  }
}

TagSingle.templateFile = __dirname + '/../html/tagSingle.html';
TagSingle.variables = [
  'tag',
  'attributes',
  'selfClosing',
];
TagSingle.boilerplate = "attributes = ((typeof attributes == 'object') ? Object.keys(attributes).map(name => attributes[name] == undefined ? name : `${name}=\"${Array.isArray(attributes[name])?attributes[name].join(' '):attributes[name]}\"`).join(' ') : attributes) || '';";

module.exports = TagSingle;
