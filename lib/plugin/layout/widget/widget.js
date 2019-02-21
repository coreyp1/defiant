"use strict";

const TagPair = require('../../theme/renderable/tagPair');

class Widget extends TagPair {
  constructor(engine, data={}) {
    super(engine, data);
    this.data.attributes.id.add(this.constructor.name);
    this.title = this.constructor.title;
    this.description = this.constructor.description;
  }
}

Widget.Instance = require('./widgetInstance');
Widget.id = ''; // Unique Identifier.
Widget.title = ''; // Used to identify the Widget to the Admin.
Widget.description = ''; // Additional information for use by the Admin.
Widget.templateFile = __dirname + '/../html/widget.html';
Widget.variables = [
  'attributes',
  'content'
];

module.exports = Widget;
