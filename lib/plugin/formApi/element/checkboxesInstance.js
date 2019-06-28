"use strict";

const ElementInstance = require('./elementInstance');

class CheckboxesInstance extends ElementInstance {
  async init(data={}) {
    const theme = this.context.theme;
    const TagSingle = theme.getRenderable('TagSingle');
    const TagPair = theme.getRenderable('TagPair');
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Element = FormApi.getElement('Element');

    for (let entry of (this.data.checkboxes || [])) {
      // Create the Checkbox.
      const checkboxName = `${this.name}-${entry.value}`;
      let checkbox = TagSingle.newInstance(this.context, {
        name: checkboxName,
        data: {
          tag: 'input',
          attributes: {
            type: 'checkbox',
            name: `${this.name}[]`,
            id: new Set([checkboxName]),
            value: entry.value,
          },
        },
      });
      if (this.context.post[this.formInstance.id]) {
        if (this.context.post[this.formInstance.id][this.name] && this.context.post[this.formInstance.id][this.name][entry.value]) {
          checkbox.data.attributes.checked = undefined;
        }
      }
      else if (entry.defaultChecked) {
        checkbox.data.attributes.checked = undefined;
      }

      this.addInstance(
        // This container will hold all parts of an individual checkbox
        Element.newInstance(this.context, {
          name: checkboxName,
          // This is the wrapper
          wrap: TagPair.newInstance(this.context, {
            data: {
              tag: 'div',
              attributes: {
                class: new Set(['form-checkbox', checkboxName]),
              },
            },
          }),
        })
        .addInstance(
          // Create the Checkbox Label.
          Element.newInstance(this.context, {
            name: `${this.name}-${entry.value}-label`,
            wrap: TagPair.newInstance(this.context, {
              data: {
                tag: 'label',
                attributes: {
                  for: checkboxName,
                  id: new Set([`label-${checkboxName}`]),
                },
              },
            }),
          })
            // The Label must surround the checkbox
            .addInstance(checkbox)
            .addInstance(TagPair.newInstance(this.context, {
              data: {
                tag: 'span',
                attributes: {
                  class: new Set(['label-text']),
                },
                content: entry.label,
              },
            })
          )
        )
      );
    }

    // Lastly, wrap all of the checkboxes.
    this.wrap = TagPair.newInstance(this.context, {
      data: {
        tag: 'div',
        attributes: {
          class: new Set(['form-checkboxes', data.name]),
        }
      },
    });
    await super.init(data);
  }
}

module.exports = CheckboxesInstance;
