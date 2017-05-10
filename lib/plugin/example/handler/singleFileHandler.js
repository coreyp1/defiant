"use strict";

const FileHandler = require('../../router/fileHandler');
const File = require('../../http/response/file');
const {coroutine: co} = require('bluebird');

class SingleFileHandler extends Handler {
  constructor(data={}) {
    super(data);
    this.target = this.target || this.constructor.target;
  }

  allowAccess(context) {
    let t = context.request.urlTokenized;
    return Promise.resolve((t !== undefined) && (('/' + t.join('/')) == context.request._parsedUrl.pathname));
  }

  init(context) {
    return co(function*(self) {
      context.httpResponse = new File(context, {
        path: self.target,
      });
    })(this);
  }
}

SingleFileHandler.id = 'Example.FileHandler';
SingleFileHandler.path = 'example.file/static.txt';
SingleFileHandler.target = __dirname + '/../file/static.txt';
// TODO: Translate
SingleFileHandler.menu = {
  menu: 'default',
  text: 'Single File Example',
  description: 'Example of outputting a single file',
};

module.exports = SingleFileHandler;
