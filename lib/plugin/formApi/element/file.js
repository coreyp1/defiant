"use strict";

const Element = require('./element');
const {coroutine: co} = require('bluebird');
const merge = require('../../../util/merge');

class File extends Element {
  init(context) {
    return co(function*(self, superInit){
      let theme = context.theme,
          TagSingle = theme.getRenderable('TagSingle'),
          TagPair = theme.getRenderable('TagPair'),
          Encrypt = context.engine.pluginRegistry.get('FormApi').getElement('Encrypt'),
          post = (context.post && context.post[self.form.name]) ? context.post[self.form.name] : {},
          Orm = context.engine.pluginRegistry.get('Orm'),
          fileUpload = Orm.entity.get('fileUpload');

      // Compile a list of currently uploaded files.
      let list = [];
      for (let record of Object.values(post[`${self.name}[files]`] || {})) {
        let file = yield fileUpload.load({id: record.id});
        // TODO: Escape.
        list.push((file && file.originalName) ? `Current file: <span class="filename">${file.originalName}</span>, Size: <span class="filesize">${file.size}</span>` : '');
      }

      self.addElement(new TagSingle(merge({
        name: self.name,
        tag: 'input',
        attributes: {
          type: 'file',
          name: self.name,
          value: context.post[self.form.name][self.name] != undefined ? context.post[self.form.name][self.name] : self.data.defaultValue ? self.data.defaultValue : '',
        },
        selfClosing: true,
      }, self.data)))
        .addElement(new Encrypt(`${self.name}[files]`, {
          value: post[`${self.name}[files]`] ? post[`${self.name}[files]`] : {},
          required: true
        }))
        .addElement(new TagPair({
          name: `${self.name}[info]`,
          tag: 'div',
          attributes: {
            class: ['file-upload-info'],
          },
          content: list.join('<br />'),
        }));

      // Because the sub-elements were added in the init(), we need to call
      // setform() again.
      self.setForm(self.form);

      yield superInit.call(self, context);
    })(this, super.init);
  }

  validate(context) {
    return co(function*(self, superValidate){
      // Call superValidate() first so that child elements will be unencrypted.
      yield superValidate.call(self, context);

      // TODO: Verify upload limit (not implemented yet), if set.
      // Migrate any uploaded files into the current array.
      let post = (context.post && context.post[self.form.name]) ? context.post[self.form.name] : {};
      if (!post[`${self.name}[files]`]) {
        post[`${self.name}[files]`] = {};
      }
      for (let file of Object.values(post[`${self.name}[data]`] || {})) {
        post[`${self.name}[files]`][file.id] = file;
        // Mark the entry as processed.
        post[`${self.name}`][file.uuid].processed = true;
      }
    })(this, super.validate);
  }
}

module.exports = File;
