"use strict";

const Handler = require('../../router/handler');
const File = require('../../http/response/file');
const {coroutine: co} = require('bluebird');

class FileHandler extends Handler {
  constructor(data={}) {
    super(data);
    this.target = data.target ? data.target : (this.target ? this.target : this.constructor.target);
  }

  allowAccess(context) {
    let t = context.request.urlTokenized;
    return Promise.resolve((t !== undefined) && (('/' + t.join('/')) == context.request._parsedUrl.pathname));
  }

  showLink(path, context) {
    // Default to always showing the link.
    return Promise.resolve(true);
  }

  init(context) {
    return co(function*(self) {
      context.httpResponse = new File(context, {
        path: self.target,
      });
    })(this);
  }
}

FileHandler.id = 'Example.FileHandler';
FileHandler.path = 'example.file/static.txt';
FileHandler.target = __dirname + '/../file/static.txt';
// TODO: Translate
FileHandler.menu = {
  menu: 'default',
  text: 'Single File Example',
  description: 'Example of outputting a single file',
};

module.exports = FileHandler;
