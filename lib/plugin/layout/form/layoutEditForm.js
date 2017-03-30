'use strict';

const Form = require('../../fapi/form');
const {coroutine: co, promisify} = require('bluebird');

class LayoutEditForm extends Form {
  init(context) {
    let fapi = context.engine.plugin.get('Fapi'),
        Button = fapi.getElement('Button'),
        Hidden = fapi.getElement('Hidden'),
        Textarea = fapi.getElement('Textarea');
    let Layout = context.engine.plugin.get('Layout');
    let Settings = context.engine.plugin.get('Settings');

    return co(function*(self, superInit) {
      let layout = Layout.layouts.get(self.buildState.layoutId);
      let layoutData = yield Settings.cache.get(`layout/${self.buildState.layoutId}.json`).load();
      self.addElement(new Textarea('templateContents', {
          label: 'Template',
          description: 'Provide the HTML and other template information that will be used to render this layout.',
          defaultValue: layoutData.templateContents,
          required: true,
        }))
        .addElement(new Textarea('paths', {
          label: 'Paths',
          description: 'What paths should this layout be applied to?  Put each path on a separate line.',
          defaultValue: layoutData.paths.join("\n"),
        }))
        .addElement(new Hidden('regions', {
          value: JSON.stringify(layoutData.regions),
        }))
        .addElement(new Textarea('variables', {
          label: 'Region Names',
          description: 'These are the names of the regions that can be used in the Template.  Put each region name on a separate line.',
          defaultValue: layoutData.variables.join("\n"),
        }))
        .addElement(new Button('submit', {value: 'save', content: 'Save'}));
      return yield superInit.call(self, context);
    })(this, super.init);
  }

  validate(context) {
    // In the event of an error, set context.fapiError = true;
    return co(function*(self, superValidate){
      yield superValidate.call(self, context);
      
      let post = context.post[self.name];

      if (!context.fapiError) {
        // TODO: Verify that template compiles.
      }

      if (!context.fapiError) {
        // TODO: Verify that regions can be parsed.
        // TODO: Verify that the regions and widgets are valid.
      }

      if (!context.fapiError) {
        // TODO: Verify that the paths are in the correct form.
      }

      if (!context.fapiError) {
        // TODO: Verify that the variable names are valid.
      }

    })(this, super.validate);
  }

  submit(context) {
    return co(function*(self, superSubmit){
      let Settings = context.engine.plugin.get('Settings');
      let layout = Settings.cache.get(`layout/${self.buildState.layoutId}.json`);
      let layoutData = yield layout.load();
      let post = context.post[self.name];

      layoutData.templateContents = post.templateContents;
      layoutData.paths = post.paths.split("\n");
      layoutData.regions = JSON.parse(post.regions);
      layoutData.variables = post.variables.split("\n");

      let e = yield layout.save();
      if (e) {
        // TODO: Notify user of error.
        console.log(e);
      }
      yield superSubmit.call(self, context);
    })(this, super.submit);
  }
}

module.exports = LayoutEditForm;
