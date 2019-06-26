"use strict";

const FormInstance = require('../../formApi/formInstance');

class EntityEditFormInstance extends FormInstance {
  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const TagPair = this.context.theme.getRenderable('TagPair');
    const Button = FormApi.getElement('Button');
    const Entity = this.renderable.Entity;

    this.addInstance(TagPair.newInstance(this.context, {
      name: 'confirmation',
      data: {
        tag: 'div',
        content: `Are you sure that you want to delete this ${Entity.id}?`,
      }
    }))

    // Add the buttons.
    this.addInstance(Button.newInstance(this.context, {
      name: 'delete',
      data: {
        value: 'delete',
        content: 'Delete',
      },
    }));

    await super.init(data);
  }

  async submit() {
    await super.submit();

    const Entity = this.renderable.Entity;

    // Delete the entity.
    await Entity.purge(this.buildState.entity.id);

    // Delete the POST values.
    delete this.context.post[this.id];
  }
}

module.exports = EntityEditFormInstance;
