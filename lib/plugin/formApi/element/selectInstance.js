"use strict";

const ElementInstance = require('./elementInstance');

/**
 * An instance of a Select form element.
 * @class
 * @extends Defiant.Plugin.FormApi.ElementInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class SelectInstance extends ElementInstance {
  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    const self = this;
    const theme = this.context.theme;
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const TagPair = theme.getRenderable('TagPair');
    const Element = FormApi.getElement('Element');
    let counter = 0; // Used to prevent duplicate (interior) names.

    // Use `name` in addOptions().
    // The only reason is to keep eslint from complaining.
    const name = this.name;

    // Helper function to recursively add options and option groups.
    function addOptions(obj, dataOptions=[]) {
      for (let option of dataOptions) {
        if (option.optgroup) {
          // Add an option group.
          let optGroup = Element.newInstance(self.context, {
            name: name + (counter++),
            wrap: TagPair.newInstance(self.context, {
              data: {
                tag: 'optgroup',
                attributes: {
                  label: option.optgroup,
                },
              },
            }),
          });

          // Recursively add the element for this option group.
          addOptions(optGroup, option.options);
          obj.addInstance(optGroup);
        }
        else {
          // Add an option.
          let o = TagPair.newInstance(self.context,{
            name: name + (counter++),
            data: {
              tag: 'option',
              attributes: {
                value: option.value,
              },
              content: option.label,
            },
          });
          if (defaultValues[option.value]) {
            o.data.attributes.selected = undefined;
          }
          obj.addInstance(o);
        }
      }
    }

    // Create the Select as a wrapper into which child element will be added.
    let select = Element.newInstance(this.context, {
      name: `${name}[]`,
      wrap: TagPair.newInstance(this.context, {
        data: {
          tag: 'select',
          attributes: {
            name: `${name}[]`,
            class: new Set([name]),
          },
        },
      }),
    });
    this.addInstance(select);

    // Determine the default values.
    let defaultValues = {};
    if (this.context.post[this.formInstance.id] && this.context.post[this.formInstance.id][name]) {
      // There is a post value.  Use this for the default.
      for (let key in this.context.post[this.formInstance.id][name]) {
        defaultValues[key] = true;
      }
    }
    else {
      // There is not a post value.  Use the declared defaults.
      for (let key of this.data.defaultValues || []) {
        defaultValues[key] = true;
      }
    }

    // Add the options and option groups.
    addOptions(select, this.data.options)

    // Lastly, wrap everything.
    this.wrap = TagPair.newInstance(this.context, {
      data: {
        tag: 'div',
        attributes: {
          class: new Set(['form-select', name]),
        },
      }
    });

    await super.init(data);
  }
}

module.exports = SelectInstance;
