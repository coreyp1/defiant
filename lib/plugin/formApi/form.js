"use strict";

const Collection = require('../theme/renderable/collection');
const Registry = require('../../util/registry');
const merge = require('../../util/merge');

class Form extends Collection {
  constructor(engine, setup={}) {
    super(engine, merge({
      instanceSetup: {
        name: '',
        data: {
          tag: 'form',
          attributes: {
            id: new Set(),
            class: new Set(),
            method: 'post',
            action: '',
            enctype: 'multipart/form-data',
            'accept-charset': 'UTF-8',
            autocomplete: 'on', //HTML 5
            novalidate: false, //HTML 5 - 'novalidate'
          },
        },
      },
    }, setup));
    this.instanceSetup.name = this.name || this.constructor.name;
    let idata = this.instanceSetup.data;
    if (idata.attributes && idata.attributes.id && idata.attributes.id.add) {
      idata.attributes.id.add(this.name);
    }

    this.validateRegistry = new Registry();
    this.submitRegistry = new Registry();
  }
}

Form.Instance = require('./formInstance');
module.exports = Form;
