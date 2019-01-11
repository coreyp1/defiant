"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class File extends Element {
  async init(context) {
    let theme = context.theme,
        TagSingle = theme.getRenderable('TagSingle'),
        TagPair = theme.getRenderable('TagPair'),
        Encrypt = context.engine.pluginRegistry.get('FormApi').getElement('Encrypt'),
        post = (context.post && context.post[this.form.name]) ? context.post[this.form.name] : {},
        Orm = context.engine.pluginRegistry.get('Orm'),
        fileUpload = Orm.entityRegistry.get('fileUpload');

    // Compile a list of currently uploaded files.
    let list = [];
    for (let record of Object.values(post[`${this.name}[files]`] || {})) {
      let file = await fileUpload.load({id: record.id});
      // TODO: Escape.
      list.push((file && file.originalName) ? `Current file: <span class="filename">${file.originalName}</span>, Size: <span class="filesize">${file.size}</span>` : '');
    }

    this.addElement(new TagSingle(merge({
      name: this.name,
      tag: 'input',
      attributes: {
        type: 'file',
        name: this.name,
        value: context.post[this.form.name][this.name] != undefined ? context.post[this.form.name][this.name] : this.data.defaultValue ? this.data.defaultValue : '',
      },
      thisClosing: true,
    }, this.data)))
      .addElement(new Encrypt(`${this.name}[files]`, {
        value: post[`${this.name}[files]`] ? post[`${this.name}[files]`] : {},
        required: true
      }))
      .addElement(new TagPair({
        name: `${this.name}[info]`,
        tag: 'div',
        attributes: {
          class: ['file-upload-info'],
        },
        content: list.join('<br />'),
      }));

    // Because the sub-elements were added in the init(), we need to call
    // setform() again.
    this.setForm(this.form);

    return super.init(context);
  }

  async validate(context) {
    // Call super.validate() first so that child elements will be unencrypted.
    await super.validate(context);

    // TODO: Verify upload limit (not implemented yet), if set.
    // Migrate any uploaded files into the current array.
    let post = (context.post && context.post[this.form.name]) ? context.post[this.form.name] : {};
    if (!post[`${this.name}[files]`]) {
      post[`${this.name}[files]`] = {};
    }
    for (let file of Object.values(post[`${this.name}[data]`] || {})) {
      post[`${this.name}[files]`][file.id] = file;
      // Mark the entry as processed.
      post[`${this.name}`][file.uuid].processed = true;
    }
  }
}

module.exports = File;
