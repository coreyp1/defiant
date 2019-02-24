'use strict';

const FormInstance = require('../../formApi/formInstance');
const tryCatch = require('../../../util/tryCatch');
const isValidVariableName = require('../../../util/isValidVariableName');

class LayoutEditFormInstance extends FormInstance {
  async init(data={}) {
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Button = FormApi.getElement('Button');
    const Hidden = FormApi.getElement('Hidden');
    const Static = FormApi.getElement('Static');
    const Textarea = FormApi.getElement('Textarea');
    const WidgetPlacement = FormApi.getElement('WidgetPlacementRenderable');
    const Layout = this.context.engine.pluginRegistry.get('Layout');
    const Settings = this.context.engine.pluginRegistry.get('Settings');
    let layoutData = await Settings.cacheRegistry.get(`layout/${this.buildState.layoutId}.json`).load();
    let widgets = {};
    for (let widget of Layout.widgetRegistry.getIterator()) {
      widgets[widget.id] = {
        title: widget.title,
        description: widget.description,
      };
    }
    this.addInstance(WidgetPlacement.newInstance(this.context))
      .addInstance(Textarea.newInstance(this.context, {
        name: 'templateContents',
        data: {
          label: 'Template',
          description: 'Provide the HTML and other template information that will be used to render this layout.',
          defaultValue: layoutData.templateContents,
          required: true,
        },
      }))
      .addInstance(Textarea.newInstance(this.context, {
        name: 'paths',
        data: {
          label: 'Paths',
          description: 'What paths should this layout be applied to?  Put each path on a separate line.',
          defaultValue: layoutData.paths.join("\n"),
        },
      }))
      .addInstance(Hidden.newInstance(this.context, {
        name: 'regions',
        data: {
          value: JSON.stringify(layoutData.regions),
        },
      }))
      .addInstance(Static.newInstance(this.context, {
        name: 'widgets',
        data: {
          value: JSON.stringify(widgets),
        },
      }))
      .addInstance(Textarea.newInstance(this.context, {
        name: 'variables',
        data: {
          label: 'Region Names',
          description: 'These are the names of the regions that can be used in the Template.  Put each region name on a separate line.',
          defaultValue: layoutData.variables.join("\n"),
        },
      }))
      .addInstance(Button.newInstance(this.context, {
        name: 'submit',
        data: {
          value: 'save',
          content: 'Save',
        }
      }));
    await super.init();
  }

  async validate() {
    // In the event of an error, set this.context.formApiError = true;
    await super.validate();

    let post = this.context.post[this.id];

    let variables = post.variables.split("\n").map(v => v.trim()).filter(v => v !== "");
    if (!this.context.formApiError) {
      // Verify that the variable names are valid.
      for (let variable of variables) {
        if (!isValidVariableName(variable)) {
          // TODO: Escape.
          // TODO: Translate.
          this.setError('variables', 'This region name is not allowed: ' + variable);
          break;
        }
      }
    }

    if (!this.context.formApiError) {
      // Verify that regions is valid JSON and can be parsed.
      if (tryCatch(() => {
        JSON.parse(post.regions);
      })) {
        // TODO: Translate.
        this.setError('regions', 'There was an error processing the form.  Please reload the page.');
      }
    }

    if (!this.context.formApiError) {
      // Verify that template compiles.
      // Get list of variables used in the template.
      const variableRegex = /(<%=)(([^%]|%(?!>))*)(%>)/g;
      let templateVariables = post.templateContents.match(variableRegex).map(s => s.substring(3, s.length - 2).trim());
      for (let tVar of templateVariables) {
        if (variables.indexOf(tVar) < 0) {
          // TODO: Escape.
          // TODO: Translate.
          this.setError('templateContents', 'Region name not recognized: ' + tVar);
          break;
        }
      }
    }

    if (!this.context.formApiError) {
      // TODO: Verify that the paths are in the correct form.
    }
  }

  async submit() {
    let Settings = this.context.engine.pluginRegistry.get('Settings');
    let LayoutRenderable = this.context.engine.pluginRegistry.get('Layout').layoutRegistry.get(this.buildState.layoutId);

    let layout = Settings.cacheRegistry.get(`layout/${this.buildState.layoutId}.json`);
    let layoutData = await layout.load();
    let post = this.context.post[this.id];

    LayoutRenderable.templateContents = layoutData.templateContents = post.templateContents;
    LayoutRenderable.paths = layoutData.paths = post.paths.split("\n").map(v => v.trim()).filter(v => v !== "");
    LayoutRenderable.regions = layoutData.regions = JSON.parse(post.regions);
    LayoutRenderable.variables = layoutData.variables = post.variables.split("\n").map(v => v.trim()).filter(v => v !== "");
    LayoutRenderable.refreshTemplate = true;

    let e = await layout.save();
    if (e) {
      // TODO: Translate.
      this.context.volatile.message.set('layoutEditForm', 'There was an error and the layout changes could not be saved to disk.', 'danger');
    }
    else {
      // TODO: Translate.
      this.context.volatile.message.set('layoutEditForm', 'The layout has been updated.');
    }


    await super.submit();
  }
}

module.exports = LayoutEditFormInstance;
