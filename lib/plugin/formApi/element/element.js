"use strict";

const Collection = require('../../theme/renderable/collection');

/**
 * Elements are the building blocks of forms.  They are Renderables, and as such
 * have the same paradigm of a base class and an instance class.
 *
 * The different types of form elements (textboxes, buttons, etc.) are added to
 * the [FormApi.elementRegistry]{@link Defiant.Plugin.FormApi#elementRegistry}
 * as an instantiation of the Element class (or a subclass of Element).
 *
 * When an element is added to a form, it is added as an
 * [ElementInstance]{@link Defiant.Plugin.FormApi.ElementInstance}, in which
 * each ElementInstance has settings unique to that occurrence within the form.
 * For example, a form may have multiple text boxes, each with a different
 * name, description, attributes, etc.
 *
 * Notice that, in the core FormApi, almost all Elements are merely
 * instantiations of the Element class, with most of the logic and functionality
 * being found in the ElementInstance subclass which is attached to it.
 * @todo Add validate and submit registries to the Element class, and not just
 * in the ElementInstance class.
 * @class
 * @extends Defiant.Plugin.Theme.Collection
 * @memberOf Defiant.Plugin.FormApi
 */
class Element extends Collection {}

Element.Instance = require('./elementInstance');
module.exports = Element;
