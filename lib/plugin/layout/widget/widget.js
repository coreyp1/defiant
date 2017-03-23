"use strict";

const Renderable = require('../../theme/renderable');

class Widget extends Renderable {
  constructor(data={}) {
    super(data);
    // TODO: This *definitely* shouldn't be here!
    this.templateFunction = Renderable.compileTemplate(this.constructor.variables, this.constructor.templateContents, this.constructor.boilerplate);
  }
}

Widget.templateContents = `<%= content %>`;
Widget.variables = ['content'];

module.exports = Widget;
