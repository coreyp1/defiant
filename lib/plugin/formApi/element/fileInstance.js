"use strict";

const ElementInstance = require('./elementInstance');

class FileInstance extends ElementInstance {
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    ['multiple'].map(key => this[key] = setup[key] ? setup[key] : this.constructor[key]);
  }

  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Encrypt = FormApi.getElement('Encrypt');
    const TagSingle = this.context.theme.getRenderable('TagSingle');
    const TagPair = this.context.theme.getRenderable('TagPair');
    const Orm = this.context.engine.pluginRegistry.get('Orm');
    const FileUpload = Orm.entityRegistry.get('fileUpload');
    let post = (this.context.post && this.context.post[this.formInstance.id]) ? this.context.post[this.formInstance.id] : {};

    // Compile a list of currently uploaded files.
    let list = [];
    let postedFiles = {};
    try {
      postedFiles = JSON.parse(post[`${this.name}[files]`]);
    }
    catch (e) {}
    for (let record of Object.values(postedFiles)) {
      let file = await FileUpload.load({id: record.id});
      // TODO: Escape.
      list.push((file && file.originalName) ? `Current file: <span class="filename">${file.originalName}</span>, Size: <span class="filesize">${file.size}</span>` : '');
    }

    this
      .addInstance(TagSingle.newInstance(this.context, {
        name: this.name,
        data: {
          tag: 'input',
          attributes: {
            type: 'file',
            name: this.name,
            value: this.context.post[this.formInstance.id][this.name] != undefined ? this.context.post[this.formInstance.id][this.name] : this.data.defaultValue ? this.data.defaultValue : '',
          },
          thisClosing: true,
        },
      }))
      .addInstance(Encrypt.newInstance(this.context, {
        name: `${this.name}[files]`,
        data: {
          value: JSON.stringify(post[`${this.name}[files]`] ? post[`${this.name}[files]`] : {}),
          required: true
        },
      }))
      .addInstance(TagPair.newInstance(this.context, {
        name: `${this.name}[info]`,
        data: {
          tag: 'div',
          attributes: {
            class: new Set(['file-upload-info']),
          },
          content: list.join('<br />'),
        },
      }));

    // Add the multiple attribute (if needed).
    if (this.multiple) {
      this.instanceRegistry.get(this.name).data.attributes.multiple = undefined;
    }

    // Because the sub-elements were added in the init(), we need to call
    // setform() again.
    this.setFormInstance(this.formInstance);

    await super.init(data);
  }

  async validate() {
    // Call super.validate() first so that child elements will be unencrypted.
    await super.validate();

    // TODO: Verify upload limit (not implemented yet), if set.
    // Migrate any uploaded files into the current array.
    let post = this.context.post ? (this.context.post[this.formInstance.id] || {}) : {};
    let postedFiles = {};
    try {
      postedFiles = JSON.parse(post[`${this.name}[files]`]);
    }
    catch (e) {}

    // The [data] part is provided by FormApiHandler.
    for (let file of Object.values(post[`${this.name}[data]`] || {})) {
      postedFiles[file.id] = file;
      // Mark the entry as processed.
      post[`${this.name}`][file.uuid].processed = true;
    }
    post[`${this.name}[files]`] = postedFiles;
  }
}

module.exports = FileInstance;
