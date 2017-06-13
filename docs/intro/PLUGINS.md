#Plugins

Plugins are how Defiant is extended to add new functionality as well as alter the existing behaviors.  Defiant ships with many different Plugins that provide the core functionality, however it is straightforward to create a new plugin.  There are only a few steps necessary to create a plugin.

##The Plugin Class

All Plugins are derived form the base `Defiant.Plugin` class.  A basic plugin might look like the following:

```js
const Defiant = require('defiant');
const {coroutine: co} = require('bluebird');

class MyPlugin extends Defiant.Plugin {
  // Class Construtor
  constructor(engine) {
    super(engine);
    // Perform any other synchronous setup.
  }
  // Class init function
  init() {
    return co(function*(self, superInit){
      // Call the parent init.
      yield superInit.call(self);
      // Perform other (asynchronous) init steps.
    })(this, super.init);
  }
}

MyPlugin.weight = 0; // May be omitted if weigth = 0.
```

Your plugin can be added to your `index.js` via a simple function call.  See README.md for more information on the setup.

```js
engine.addPlugin(MyPlugin);
```

##Conventions

There are a few conventions that Defiant modules try to follow.

###Referencing Defiant

You will undoubtedly need to reference classes from Defiant.  It is strongly suggested that you only reference classes through the Defiant object, as opposed to trying to traverse the directory structure.

```js
const Defiant = require('defiant');

// When referencing the Registry class, do this:
var exampleRegistry = new Defiant.util.Registry();

// Not this:
var exampleRegistry2 = new (require('defiant/lib/util/registry'))();
```

###Registries

The variable name for an instantiated Registry (`Defiant.util.Registry`) is usually singular and ends with the word "Registry", using camelcase capitalization.  For example, `blobRegistry` is preferable to `blobsRegistry`, `blobs`, or `blobregistry`.

###Class Names

It is common for plugins to create subclasses, as they are used heavily in the architecture of Defiant.  It is suggested that, if a class is derived from another class, the parent class is included in the name in a way that helps any other developer to understand your code.

Obviously, this suggestion is very subjective in application.  For example, the Form API plugin is named `FormApi`, not `FormApiPlugin`, however the Router Handlers almost always include the word "Handler" in their class name.  Use your judgement as to which is appropriate.

##Don't Hack Core.

Defiant is supposed to be flexible, not just in ability, but in the APIs that it provides.  Defiant Plugins should also be flexible.  A well-architected framework should be able to support modifications to its behavior without a developer needing to alter the original source files.  If a developer cannot effect the desired behavior without hacking the core, then this should be considered to be a bug, and a bug report should be filed detailing the deficiency, as well as giving a proposed solution.

Any Plugin written for Defiant should embrace the "Don't Hack Core" philosophy, too.  As other open source projects have demonstrated, strict adherence to this philosophy will, in turn, foster expansive and imaginative development and advancement of the Defiant ecosystem.
