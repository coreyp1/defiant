"use strict";

const Attribute = require('./attribute');
const Field = require('../../queryApi/field');

/**
 * An Attribute representing arbitrary text.
 * @class
 * @extends Defiant.Plugin.Orm.Attribute
 * @memberOf Defiant.Plugin.Orm
 */
class Text extends Attribute {
  /**
   * Returns the schema of the table.
   * @function
   * @returns {Object}
   *   A description of the table.
   */
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

  /**
   * Return an array of keys that the Attribute should check that, if the value
   * has changed, then a new revision must be created.
   * @function
   * @returns {String[]}
   *   The names of values that need to be checked in order to realize that the
   *   a new revision must be created.
   */
  keysToCheckForChange() {
    return super.keysToCheckForChange().concat(['value']);
  }

  /**
   * Determine whether or not the value is empty.
   * @function
   * @async
   * @param {Mixed} value
   *   The value to be checked.
   * @returns {boolean}
   *   Return `true` if the value is empty, otherwise return `false`.
   */
  async valueIsEmpty(value) {
    return (await super.valueIsEmpty(value)) || (value.value === undefined) || (value.value === "");
  }

  /**
   * Return the list of fields available for use in a query by the
   * [QueryAPI]{@link Defiant.Plugin.QueryApi}.
   * @function
   * @returns {Map<String,Defiant.Plugin.QueryApi.Field>}
   *   Key/value pairs representing the queryable fields.
   */
  getQueryFields() {
    let fields = super.getQueryFields();
    fields[this.attributeName] = new Field(this.engine, {
      tableName: this.id,
      fieldName: 'value',
    });
    return fields;
  }

  /**
   * This function is called when the attribute needs to be added to a form.
   * The entity is in formInstance.entity.
   * @function
   * @async
   * @param {Defiant.Plugin.FormApi.ElementInstance} elementInstance
   *   The element instance to which form elements for this attribute must be
   *   added.
   */
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

  /**
   * This function is called when a form has passed validation and the attribute
   * needs to be added to the `formInstance.entity` object.
   * @function
   * @async
   * @param {Defiant.Plugin.FormApi.ElementInstance} elementInstance
   *   The element instance to which form elements for this attribute must be
   *   added.
   */
  async formSubmit(elementInstance) {
    const formInstance = elementInstance.formInstance;
    elementInstance.attribute.value = formInstance.context.post[formInstance.id][`${elementInstance.name}[value]`];
  }
}

module.exports = Text;
