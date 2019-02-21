"use strict";

const Renderable = require('./renderable');
const merge = require('../../../util/merge');

class TagSingle extends Renderable {
  constructor(engine, data={}) {
    super(engine, merge({
      data: {
        attributes: {
          id: new Set(),
          class: new Set(),
        }
      }
    }, data));
  }

  static parseAttributes(attributes) {
    return (typeof attributes == 'object')
      ? Object.keys(attributes).map(name => attributes[name] == undefined
        ? name
        : `${name}="${Array.isArray(attributes[name])
            ? attributes[name].join(' ')
            : (attributes[name] instanceof Set
              ? Array.from(attributes[name]).join(' ')
              : attributes[name])
            }"`).join(' ')
      : attributes;
  }
}

TagSingle.templateFile = __dirname + '/../html/tagSingle.html';
TagSingle.variables = [
  'tag',
  'attributes',
  'selfClosing',
];
// TODO: Sanitize attribute values.
// This boilerplate is an adaptation of TagSingle.parseAttributes() above.
TagSingle.boilerplate = `function ${TagSingle.parseAttributes.toString()}; attributes = parseAttributes(attributes);`;

module.exports = TagSingle;
