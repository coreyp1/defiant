#Defiant Code Structure.

Because Defiant is a framework, it is important to understand how it is put together and how to reference its many different parts.  This page will give you a broad overview of how the Defiant codebase is laid out.

##Importing Defiant

```js
const Defiant = require('defiant');
```

When imported in the manner shown above, the constant `Defiant` is a JavaScript object that contains all of the classes that are defined within the project.  For example, `Defiant.Engine` is the `Engine` class, and `Defiant.util` contains utility functions used throughout the project.  The complete list of included entries (as well as their file paths) can be found in [defiant.js](..../lib/defiant.js).

To avoid circular `require()` statements, all Defiant code uses relative urls when `require()`ing other files.  Any code that is *not* included in the Defiant project itself, however, should use the `Defiant` object to referece any and all of Defiant's internals, and not try to traverse the paths.

Do this:
```js
const Defiant = require('defiant');
let engine = new Defiant.Engine();
```

Do *not* do this:
```js
const Engine = require('defiant/lib/engine');
let engine = new Engine();
```

##Utility Functions

Defiant has several utility functions located under `Defiant.util`.  Generally speaking, functions have lowercase names, while Objects (that need to be instantiated) have an uppercase name.  This convention is generally followed unless there is a compelling reason (e.g., code readability) to depart from it.

##Libraries and Plugins

A Plugin is the central tool for interacting with the Defiant Framework.  A Plugin can make use of any of the available APIs necessary to complete its purpose.

A Library is simply a specific type of Plugin and can do everything that a Plugin can do.  The difference is in the purpose of the code.  Plugins extend and alter the functionality of Defiant.  Libraries serve as a shim between Defiant and other, otherwise unrelated, Node.js projects.