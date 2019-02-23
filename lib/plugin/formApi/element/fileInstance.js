"use strict";

const Element = require('./element');
const merge = require('../../../util/merge');

class File extends Element {
  async init(context, data={}) {
    data = await super.init(context, data);
    const Orm = context.engine.pluginRegistry.get('Orm');
    const FileUpload = Orm.entityRegistry.get('fileUpload');
    let post = (context.post && context.post[data.formData.name]) ? context.post[data.formData.name] : {};

    // Compile a list of currently uploaded files.
    let list = [];
    for (let record of Object.values(post[`${data.name}[files]`] || {})) {
      let file = await FileUpload.load({id: record.id});
      // TODO: Escape.
      list.push((file && file.originalName) ? `Current file: <span class="filename">${file.originalName}</span>, Size: <span class="filesize">${file.size}</span>` : '');
    }

    this.addElement(data, {
      tag: 'input',
      type: 'TagSingle',
      name: data.name,
      attributes: {
        type: 'file',
        name: data.name,
        value: context.post[data.formData.name][data.name] != undefined ? context.post[data.formData.name][data.name] : data.data.defaultValue ? data.data.defaultValue : '',
      },
      thisClosing: true,
    })
      .addElement(data, {
        type: 'Encrypt',
        name: `${data.name}[files]`,
        value: post[`${data.name}[files]`] ? post[`${data.name}[files]`] : {},
        required: true
      })
      .addElement(data, {
        tag: 'div',
        type: 'TagPair',
        name: `${data.name}[info]`,
        attributes: {
          class: ['file-upload-info'],
        },
        content: list.join('<br />'),
      });

    // Because the sub-elements were added in the init(), we need to call
    // setform() again.
    this.setForm(data, data.formData);

    return data;
  }

  async validate(context, data) {
    // Call super.validate() first so that child elements will be unencrypted.
    await super.validate(context, data);

    // TODO: Verify upload limit (not implemented yet), if set.
    // Migrate any uploaded files into the current array.
    let post = (context.post && context.post[data.formData.name]) ? context.post[data.formData.name] : {};
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
