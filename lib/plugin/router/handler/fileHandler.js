"use strict";

const Handler = require('../../router/handler');
const File = require('../../http/response/file');

class FileHandler extends Handler {
  constructor(data={}) {
    super(data);
    this.target = data.target ? data.target : (this.target ? this.target : this.constructor.target);
  }

  async allowAccess(context) {
    let t = context.request.urlTokenized;
    return (t !== undefined) && (('/' + t.join('/')) == context.request._parsedUrl.pathname);
  }

  async showLink(path, context) {
    // Default to always showing the link.
    return true;
  }

  async init(context) {
    context.httpResponse = new File(context, {
      path: this.target,
    });
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
