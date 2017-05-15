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
          Encrypt = context.engine.plugin.get('FormApi').getElement('Encrypt'),
          post = (context.post && context.post[self.form.name]) ? context.post[self.form.name] : {},
          Orm = context.engine.plugin.get('Orm'),
          fileUpload = Orm.entity.get('fileUpload'),
          file = post[`${self.name}[data]`] ? yield fileUpload.load({id: post[`${self.name}[data]`].id}) : undefined;

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
        .addElement(new Encrypt(`${self.name}[data]`, {value: post[`${self.name}[data]`] ? post[`${self.name}[data]`] : {}}))
        .addElement(new TagPair({
          name: `${self.name}[info]`,
          tag: 'div',
          attributes: {
            class: ['file-upload-info'],
          },
          // TODO: Escape.
          content: (file && file.originalName) ? `Current file: <span class="filename">${file.originalName}</span>, Size: <span class="filesize">${file.size}</span>` : '',
        }));

      // Because the sub-elements were added in the init(), we need to call
      // setform() again.
      self.setForm(self.form);

      yield superInit.call(self, context);
    })(this, super.init);
  }
}

module.exports = File;
