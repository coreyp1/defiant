"use strict";

const ElementInstance = require('./elementInstance');

/**
 * An instance of a File upload form element.
 * @class
 * @extends Defiant.Plugin.FormApi.ElementInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class FileInstance extends ElementInstance {
  /**
   * @constructor
   * @param {Defiant.Plugin.FormApi.File} renderable
   *   The File element that this is an instance of.
   * @param {Object} setup
   *   The configuration object.
   * @param {Defiant.Context} context
   *   The request context.
   * @returns {Defiant.Plugin.Theme.RenderableInstance}
   *   The instantiation of the RenderableInstance.
   */
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    [
      /**
       * @member {boolean} [Defiant.Plugin.FormApi.FileInstance#multiple=false]
       *   Whether or not to support multiple file uploads.
       *
       *   If multiple uploads are enabled, then the user may upload and delete
       *   individual uploads before the form is finally submitted.
       *
       *   If multiple uploads are not enabled, then any subsequent upload will
       *   replace the previous upload.
       */
      'multiple',
    ].map(key => this[key] = setup[key] ? setup[key] : this.constructor[key]);
  }

  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
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
            value: this.context.post[this.formInstance.id] && (this.context.post[this.formInstance.id][this.name] != undefined)
              ? this.context.post[this.formInstance.id][this.name]
              : this.data.defaultValue
                ? this.data.defaultValue
                : '',
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

  /**
   * Perform the form validations for this particular element and its child
   * elements.
   * @todo Support file upload limits.
   * @function
   * @async
   */
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
