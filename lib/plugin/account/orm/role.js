"use strict";

const Text = require('../../orm/attribute/text');

/**
 * Define a Role attribute type for use by entities and the ORM system.
 * @class
 * @extends Defiant.Plugin.Orm.Text
 * @memberOf Defiant.Plugin.Account
 */
class Role extends Text {
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
    const Account = formInstance.context.engine.pluginRegistry.get('Account');
    const Checkboxes = FormApi.getElement('Checkboxes');

    // Find which roles are already present.
    let accountRoles = new Set();
    for (let attr of elementInstance.attribute) {
      if (attr.value) {
        accountRoles.add(attr.value);
      }
    }

    let roles = [];
    for (let roleKey of Object.keys(Account.role.data).sort()) {
      let role = Account.role.data[roleKey];
      if (!role.automatic) {
        roles.push({
          value: roleKey,
          label: role.title,
          defaultChecked: accountRoles.has(roleKey),
        });
      }
    }

    elementInstance.addInstance(Checkboxes.newInstance(formInstance.context, {
      name: elementInstance.name,
      data: {
        checkboxes: roles,
        description: 'Check the roles that should be applied.',
      },
    }));

    //super.formInit(elementInstance);
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
    const thisPost = formInstance.context.post[formInstance.id][elementInstance.name];
    const submittedRoles = new Set(...Object.keys(thisPost || {}));

    // First, iterate through the roles currently in the elementInstance, and
    // ignore them if there is no change, and clear them if they should be
    // removed.
    let processedRoles = new Set();
    for (let entry of elementInstance.attribute) {
      if (entry.value && !submittedRoles.has(entry.value)) {
        // Cause the role to be removed.
        entry.value = '';
      }
      processedRoles.add(entry.value);
    }

    // Now check to see if there are any roles that need to be added.
    const Account = formInstance.context.engine.pluginRegistry.get('Account');
    for (let roleKey of Object.keys(Account.role.data)) {
      if (!Account.role.data[roleKey].automatic && !processedRoles.has(roleKey) && thisPost && thisPost[roleKey]) {
        elementInstance.attribute.push({value: roleKey});
      }
    }
  }
}

Role.formType = 'group';

module.exports = Role;
