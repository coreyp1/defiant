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
    let headerRow = '<tr><th></th>';
    for (let role of Object.keys(Account.role.data)) {
      headerRow += `<th>${Account.role.data[role].title}</th>`;
    }
    headerRow += '</tr>';

    // Create the table body.
    let stream = Stream.newInstance(this.context, {name: 'permissionTable'});
    stream.addInstance(`<table><thead><thead>${headerRow}</thead><tbody>`);
    for (let perm of Object.keys(Account.permission)) {
      stream.addInstance(`<tr><td><dl><dt>${Account.permission[perm].title}</dt><dd>${Account.permission[perm].description}</dd></dl></td>`);
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
    stream.addInstance(`</tbody></table>`);

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
