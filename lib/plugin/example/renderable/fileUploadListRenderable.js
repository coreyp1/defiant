"use strict";

const Renderable = require('../../theme/renderable');

class FileUploadListRenderable extends Renderable {
  async init(context, data={}) {
    // Just an example of calling the parent function, Renderable.init().
    return await super.init(context, data);
  }
}

FileUploadListRenderable.templateFile = __dirname + '/../html/FileUploadListRenderable.html';
FileUploadListRenderable.variables = ['files'];

module.exports = FileUploadListRenderable;
