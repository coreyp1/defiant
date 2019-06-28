"use strict";

const FormInstance = require('../../formApi/formInstance');

class PermissionFormInstance extends FormInstance {
  constructor(renderable, setup, context) {
    super(renderable, setup, context);
    this.data.attributes.id.add('permission');
  }

  async init(data={}) {
    const Account = this.context.engine.pluginRegistry.get('Account');
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Stream = FormApi.getElement('Stream');
    const Checkbox = FormApi.getElement('Checkbox');
    const Button = FormApi.getElement('Button');

    // Create the Table Header
    let headerCols = '';
    for (let role of Object.keys(Account.role.data)) {
      headerCols += `<th>${Account.role.data[role].title}</th>`;
    }
    let headerRow = `<tr><th colspan=2>General</th>${headerCols}</tr>`;

    // Create the table body.
    let stream = Stream.newInstance(this.context, {name: 'permissionTable'});
    stream.addInstance(`<table><thead>${headerRow}</thead><tbody>`);
    let oldPermissionGroup = '';

    // Order the permissions alphabetically.
    for (let perm of Object.keys(Account.permission).sort()) {
      // Determine if this is a new grouping of permissions.
      let permArray = perm.split('.');
      permArray.splice(-1, 1);
      let permissionGroup = permArray.join(' / ');
      if (oldPermissionGroup != permissionGroup) {
        // This is a new grouping, so re-state the roles.
        // Re-stating the roles makes it easier to see what is happening when
        // the form gets really long.
        oldPermissionGroup = permissionGroup;
        stream.addInstance(`<tr><th colspan=2 style="text-transform:capitalize">${permissionGroup}</th>${headerCols}</tr>`);
      }

      stream.addInstance(`<tr><td></td><td><dl><dt>${Account.permission[perm].title}</dt><dd>${Account.permission[perm].description}</dd></dl></td>`);

      // Add the actual checkboxes.
      for (let role of Object.keys(Account.role.data)) {
        let checkbox = Checkbox.newInstance(this.context, {
          name: `${role}[${perm}]`,
          data: {
            value: '1',
            attributes: {},
          },
        });
        if (Account.permissionSet[role] && Account.permissionSet[role].has(perm)) {
          checkbox.data.defaultChecked = true;
        }
        stream.addInstance('<td>')
          .addInstance(checkbox)
          .addInstance('</td>');
      }
      stream.addInstance('</tr>');
    }

    // Finish up the table.
    stream.addInstance(`</tbody></table>`);

    // Put the form together.
    this
      .addInstance(stream)
      .addInstance(Button.newInstance(this.context, {
        name: 'update',
        data: {
          value: 'update',
          content: 'Update',
        },
      }));
    await super.init(data);
  }

  async submit() {
    const Account = this.context.engine.pluginRegistry.get('Account');
    let newPermissions = {};
    for (let role of Object.keys(Account.role.data)) {
      if (!newPermissions[role]) {
        newPermissions[role] = [];
      }
      for (let perm of Object.keys(Account.permission)) {
        const name = `${role}[${perm}]`;
        if (this.context.post[this.id] && this.context.post[this.id][name]) {
          newPermissions[role].push(perm);
        }
      }
    }
    Account.permissionArray.data = newPermissions;
    await Account.permissionArray.save();
    Account.parsePermissions();
    await super.submit();

    // Delete the POST values.
    delete this.context.post[this.id];
  }
}

module.exports = PermissionFormInstance;
