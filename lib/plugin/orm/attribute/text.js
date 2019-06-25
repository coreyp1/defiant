"use strict";

const Attribute = require('./attribute');
const Field = require('../../queryApi/field');

class Text extends Attribute {
  schema() {
    let schema = super.schema();
    schema.columns.push({
      name: 'value',
      dataType: 'TEXT',
      notNull: false,
      unique: false,
    });
    return schema;
  }

  keysToCheckForChange() {
    return super.keysToCheckForChange().concat(['value']);
  }

  async valueIsEmpty(value) {
    return (await super.valueIsEmpty(value)) || (value.value === undefined) || (value.value === "");
  }

  getQueryFields() {
    let fields = super.getQueryFields();
    fields[this.attributeName] = new Field(this.engine, {
      tableName: this.id,
      fieldName: 'value',
    });
    return fields;
  }

  async formInit(elementInstance) {
    const formInstance = elementInstance.formInstance;
    const FormApi = formInstance.context.engine.pluginRegistry.get('FormApi');
    const Text = FormApi.getElement('Text');
    elementInstance.addInstance(Text.newInstance(formInstance.context, {
      name: `${elementInstance.name}[value]`,
      data: {
        defaultValue: elementInstance.attribute.value,
        label: this.data.label || undefined,
      },
    }));
    super.formInit(elementInstance);
  }

  async formSubmit(elementInstance) {
    const formInstance = elementInstance.formInstance;
    elementInstance.attribute.value = formInstance.context.post[formInstance.id][`${elementInstance.name}[value]`];
  }
}

module.exports = Text;
