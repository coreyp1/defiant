"use strict";

const Handler = require('../../router/handler');
const Themed = require('../../http/response/themed');

class EntityEditHandler extends Handler {
  constructor(data={}) {
    super(data);
    ['form'].map(val => this[val] = data[val] ? data[val] : (this[val] ? this[val] : this.constructor[val]));
    this.data = data;
  }
  async init(context) {
    await super.init(context);

    const FormApi = context.engine.pluginRegistry.get('FormApi');
    const Form = FormApi.getForm(this.data.form);
    const uuid = context.request.urlTokenized[1];
    const entity = await Form.Entity.load({uuid});
    const instance = Form.newInstance(context, {buildState: {entity}});
    await instance.init();
    context.httpResponse = new Themed(context, {
      language: 'us',
      siteName: 'Defiant',
      head: '',
      jsFooter: '',
      content: await instance.commit(),
    });
  }
}

module.exports = EntityEditHandler;
