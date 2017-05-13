"use strict";

const Renderable = require('../../theme/renderable');
const {coroutine: co} = require('bluebird');

class FileUploadListRenderable extends Renderable {
  init(context) {
    return co(function*(self, superInit) {
      yield superInit.call(self, context);
    })(this, super.init);
  }
}

FileUploadListRenderable.templateFile = __dirname + '/../html/FileUploadListRenderable.html';
FileUploadListRenderable.variables = ['files'];

module.exports = FileUploadListRenderable;