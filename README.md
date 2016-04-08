# Be Defiant!

**Defiant** is a Node.js web app framework.  Defiant is so named because its creators have strong opinions on how a system such as this should be designed, as well as its potential for use.  (It was also called "Defiant" because it seemed like so many of the existing frameworks were basically clones of one another, and we wanted to do something completely different.)

Defiant is *not* a finished project.  It is, however, an active work in progress, and we would welcome your input.

## What makes Defiant different

Defiant firmly believes that you, as a developer should be able to use this framework and add to or modify its functionality without having hack the core files.  Likewise, if you are using a 3rd party plugin for this framework, and wish to add to or modify the functionality of the plugin, then you should be able to do so without having to hack the plugin itself.  If the architecture does not support this flexibility, then this should be interpreted as a bug and should be reported as such.  In short, everything should be overridable.

Defiant does not adhere to a strict MVC framework, because that is not flexible enough for what we have in mind.

Every framework has opinions about something.  Some care about where your files are placed, and some want to enforce specific paradigms.  Defiant's opinions are about how the disparate parts should interact.  The JavaScript language and the Node.js platform provide a unique and powerful set of tools to tackle many different problems and use cases under a unified architecture.

## The Defiant Manifesto

[The Defiant Manifesto](MANIFESTO.md) explains the philosophy of the Defiant project.  They are:

1. Security
2. Privacy
3. Flexibility
4. Practicality
5. Efficiency
6. Portability
7. Community

Read the (short) Manifesto itself in order to understand how we apply these ideas.

## Getting Started

To run Defiant:
```
const Defiant = require('./defiant');

new Defiant.Engine()
  // Explicitly set a directory where Defiant should look for the settings
  // files.  If no files exist, then appropriate defaults will be generated.
  // This directory should be separate from your application code, and
  // preferably under version control.
  .defineBootstrapDirectory('/var/defiant/settings')
  // Initialize the Engine and its components.
  .init();
```

## Current State

Defiant doesn't do much at the moment, and isn't ready for serious work at all.  Why?  Because it's still being built, of course!  Parts of it only exist in the minds and conversations of the developers.  If you want to help out, then send us a message and find out what the current roadmap is.

The Form API is the most developed, however even that is lacking in many areas.

We repeat: This code is not yet intended for any production work whatsoever.

## Disclaimer

Nothing in the API is set in stone, and there's very little official documentation (although we do try to comment the code responsibly).  Furthermore, this is the first draft, and it's not even complete.  When you look at the code, remember this:  There are hacks and TODOs scattered throughout the system.  Sometimes the hack is just to get something working so that some other semi-related part can be fleshed out, and there is an intention to revisit the code later.  Sometimes the TODO is just a stub representing an idea, or indicating where something will need to interface with the system later.  Sometimes, the feature only exists in the minds of the authors.  ESP would be helpful here...

Above all, we encourage you to buck the trends and wisdom of the masses for the hope of a fresh and free coding experience.  If that fails, you can be cranky, too.  Whatever you are, though... **Be Defiant!**
