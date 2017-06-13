# Registries

*Registries* are the powerhouse of Defiant.  A Registry is a class that maintains a list of other objects.  The Registry class is found in `Defiant.util.Registry`.  There are a handful of properties that the Registry fulfills:

1. A Registry holds JavaScript objects (it does not matter if the object is instantiated with `new` or if it is a `class` definition).
2. Each object has a unique name, and the Registry can access that object using its unique name.
3. A Registry can return a list of all the objects that it contains.
4. When a Registry returns a list of its objects, the Registry can sort them according to a weight parameter.
  * In the absence of the weight parameter, a default weight of `0` is assigned to the object.
  * In the event of a tie, the order of the objects is determined by the order in which the objects were originally inserted into the Registry.

## Where Registries are used

Registries are used *everywhere* in Defiant, because they are fast, efficient, deterministic, and widely useful.  In order to more easily identify their use throughout Defiant's codebase, the word `Registry` is appended to the appropriate variable name.

Examples of Registries in use include `Engine.pluginRegistry`, `FileApi.fileManagerRegistry`, `Layout.widgetRegistry`, etc.  Collections (which are the base class for Forms and other Renderables) also use Registries for ordering the elements that they contain.

## Registry Configurations

By default, a Registry looks for a `name` attribute and a `weight` attribute on the object, however, these attribute names can be customized when the Registry is created.  Consider the following pieces of code:

```js
const Defiant = require('defiant');
let registry = new Defiant.util.Registry({
  useWeight: 'weight', // This could be omitted because 'weight' is the default
  useId: 'name'
});
registry.set({name:'foo'});
registry.set({name:'bar'});
registry.set({name:'baz',weight:-1});
for (let obj of registry.getOrderedElements()) {
  console.log(obj);
}
```

It produces the following output:

```sh
{ name: 'baz', weight: -1 }
{ name: 'foo' }
{ name: 'bar' }
```
