"use strict";

const ElementInstance = require('./elementInstance');

/**
 * An instance of a form element represented by a group of Radio buttons.
 * @class
 * @extends Defiant.Plugin.FormApi.ElementInstance
 * @memberOf Defiant.Plugin.FormApi
 */
class RadiosInstance extends ElementInstance {
  /**
   * When this function is finished, then the form should be ready to
   * be rendered as a string.
   * @function
   * @async
   * @param {Object} [data={}]
   *   The initialization data.
   */
  async init(data={}) {
    const theme = this.context.theme;
    const TagSingle = theme.getRenderable('TagSingle');
    const TagPair = theme.getRenderable('TagPair');
    const FormApi = this.context.engine.pluginRegistry.get('FormApi');
    const Element = FormApi.getElement('Element');

    for (let entry of (this.data.radios || [])) {
      // Create the Checkbox.
      const radioName = `${this.name}-${entry.value}`;
      let radio = TagSingle.newInstance(this.context, {
        name: radioName,
        data: {
          tag: 'input',
          attributes: {
            type: 'radio',
            name: `${this.name}[]`,
            id: new Set([radioName]),
            value: entry.value,
          },
        },
      });
      if (this.context.post[this.formInstance.id]) {
        if (this.context.post[this.formInstance.id][this.name] && this.context.post[this.formInstance.id][this.name][entry.value]) {
          radio.data.attributes.checked = undefined;
        }
      }
      else if (this.data.defaultValue === entry.value) {
        radio.data.attributes.checked = undefined;
      }

      this.addInstance(
        // This container will hold all parts of an individual radio
        Element.newInstance(this.context, {
          name: radioName,
          // This is the wrapper
          wrap: TagPair.newInstance(this.context, {
            data: {
              tag: 'div',
              attributes: {
                class: new Set(['form-radio', radioName]),
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
                  for: radioName,
                  id: new Set([`label-${radioName}`]),
                },
              },
            }),
          })
            // The Label must surround the radio
            .addInstance(radio)
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

    // Lastly, wrap all of the radios.
    this.wrap = TagPair.newInstance(this.context, {
      data: {
        tag: 'div',
        attributes: {
          class: new Set(['form-radioes', data.name]),
        }
      },
    });
    await super.init(data);
  }
}

module.exports = RadiosInstance;
