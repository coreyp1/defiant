"use strict";

const TagPair = require('../../theme/renderable/tagPair');
const merge = require('../../../util/merge');

class Widget extends TagPair {
  constructor(data={}) {
    super(merge({
      attributes: {
        id: [],
        class: ['widget'],
      },
    }, data));
    this.data.attributes.id.push(this.constructor.name);
    this.title = this.constructor.title;
    this.description = this.constructor.description;
  }

  commit() {
    return this.data.content.trim() ? super.commit() : '';
  }
}

Widget.id = ''; // Unique Identifier.
Widget.title = ''; // Used to identify the Widget to the Admin.
Widget.description = ''; // Additional information for use by the Admin.
Widget.templateFile = __dirname + '/../html/widget.html';
Widget.variables = [
  'attributes',
  'content'
];

module.exports = Widget;
