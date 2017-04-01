'use strict';

const Form = require('../../fapi/form');
const Renderable = require('../../theme/renderable');
const tryCatch = require('../../../util/tryCatch');
const isValidVariableName = require('../../../util/isValidVariableName');
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

      let variables = post.variables.split("\n").map(v => v.trim()).filter(v => v !== "");
      if (!context.fapiError) {
        // Verify that the variable names are valid.
        for (let variable of variables) {
          if (!isValidVariableName(variable)) {
            // TODO: Escape.
            // TODO: Translate.
            self.setError(context, 'variables', 'This region name is not allowed: ' + variable);
            break;
          }
        }
      }

      let regions = {};
      if (!context.fapiError) {
        // Verify that regions is valid JSON and can be parsed.
        if (tryCatch(() => {
          regions = JSON.parse(post.regions);
        })) {
          // TODO: Translate.
          self.setError(context, 'regions', 'There was an error processing the form.  Please reload the page.');
        }
      }

      if (!context.fapiError) {
        // Verify that template compiles.
        // Get list of variables used in the template.
        const regex = /(<%=)(([^%]|%(?!>))*)(%>)/g;
        let templateVariables = post.templateContents.match(regex).map(s => s.substring(3, s.length - 2).trim());
        for (let tVar of templateVariables) {
          if (variables.indexOf(tVar) < 0) {
            // TODO: Escape.
            // TODO: Translate.
            self.setError(context, 'templateContents', 'Region name not recognized: ' + tVar);
            break;
          }
        }
      }

      if (!context.fapiError) {
        // TODO: Verify that the paths are in the correct form.
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
      layoutData.paths = post.paths.split("\n").map(v => v.trim()).filter(v => v !== "");
      layoutData.regions = JSON.parse(post.regions);
      layoutData.variables = post.variables.split("\n").map(v => v.trim()).filter(v => v !== "");

      let e = yield layout.save();
      if (e) {
        // TODO: Translate.
        context.volatile.message.set('layoutEditForm', 'There was an error and the layout changes could not be saved to disk.', 'danger');
      }
      else {
        // TODO: Translate.
        context.volatile.message.set('layoutEditForm', 'The layout has been updated.');
      }
      yield superSubmit.call(self, context);
    })(this, super.submit);
  }
}

module.exports = LayoutEditForm;
