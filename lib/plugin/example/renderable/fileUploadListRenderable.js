"use strict";

const Renderable = require('../../theme/renderable');

class FileUploadListRenderable extends Renderable {
  async init(context) {
    // Just an example of calling the parent function, Renderable.init().
    await super.init(context);
  }
}

FileUploadListRenderable.templateFile = __dirname + '/../html/FileUploadListRenderable.html';
FileUploadListRenderable.variables = ['files'];

module.exports = FileUploadListRenderable;