# Be Defiant!

**Defiant** is a Node.js web app framework intended to facilitate the building of disruptive technology.

Defiant is so named because its creators have strong opinions on how a system such as this should be designed, as well as its potential for use.  (It was also called "Defiant" because it seemed like so many of the existing frameworks were basically clones of one another, and we wanted to do something completely different.)

Defiant is *not* a finished project.  It is, however, an active work in progress, and we would welcome your input.  Check out the [Roadmap](ROADMAP.md) for to see where you can jump in!

## Disuptive technology... That's vague.  What exactly do you mean?  Can you give me an example?

Let's use email as an example.  If you want your own email address (e.g., @yourname.com), you have one of two options: Either set up your own email server or have someone (like Google, Zoho, etc.) host it for you, probably for a monthly/annual fee.  Self-managing is extremely complicated (setting up firewalls, IMAP/POP3/SMTP access, a web-based front-end, DNS records with correct DKIM and SPF records, SSL certificates, spam filtering, antivirus, user management etc.), and if you get it wrong, the results can catastrophic.  Paying someone else to manage it, however, can get expensive when you need multiple user accounts, allows for little customization, and you are always at the mercy of that 3rd party (and however they may decide to spy on you).

What does this have to do with Defiant?  Defian't framework could provide all of the parts mentioned above, wrapped in a single, simple package (from the perspective of the end user).  In a sense, the framework's intent is to choreograph the interaction of all of these different, individual systems, and put them into a format that us "mere mortals" can implement safely.  Defiant wants you to be able to own and manage these technologies (and, by proxy, your own data) from the privacy of our own servers.

What kind of systems *could* be built using Defiant?
* Email (mentioned above)
* Video/audio communications (as in replacing FaceTime, Skype, Google Hangouts, etc., with personal, peer-to-peer communication via WebRTC)
* E-Commerce
* Project Management (as in replacing GitHub, Slack, Trello, etc., with a single, self-managed, private solution)
* Collaborative development tools (as in replacing Google Docs, Zoho Docs, ShareLatex, and the like)
* Help Desk and Customer Support
* Server configuration management (as in replacing Puppet and Chef)
* General CMS
* Microservices

These systems do not exist yet, but rather they show the intent behind Defiant.  We want to have a secure, easy-to-use, flexible framework from which to build (mix-and-match, really) the above-mentioned systems.  We want to take the Internet back from the big corporations and put powerful technologies back into the hands of us normal people.

By the way, we need your help to do it.  Please consider helping us to develop Defiant, and take back the Internet.  **Be Defiant!**

## What makes Defiant different

Defiant firmly believes that you, as a developer should be able to use this framework and add to or modify its functionality without having hack the core files.  Likewise, if you are using a 3rd party plugin for this framework, and wish to add to or modify the functionality of the plugin, then you should be able to do so without having to hack the plugin itself.  If the architecture does not support this flexibility, then this should be interpreted as a bug and should be reported as such.  In short, everything should be overridable.

Defiant does not adhere to a strict MVC framework, because that is not flexible enough for what we have in mind.

Every framework has opinions about something.  Some care about where your files are placed, and some want to enforce specific paradigms.  Defiant's opinions are about how the disparate parts should interact.  The JavaScript language and the Node.js platform provide a unique and powerful set of tools to tackle many different problems and use cases under a unified architecture.

## License

We believe that Open Source should be just that: completely open.  We generally disagree with some of the provisions of the GPL which places demands on other projects, and so have licensed this project under the [MIT](LICENSE) license.

## Copyright

In an ideal world, copyright would be a thing that we could ignore for the greater good.  Unfortunately, lawyers, politicians, and corporate greed have complicated things, so we must operate under the burden that they have created.  As such, the copyright holder for the Defiant project is Corey Pennycuff.  Any contributor to the project does, by virtue of their willful contribution, hereby agrees to assign copyright of the contribution to Corey Pennycuff and affirms that they have the legal authority to do so.  Exception to this provision is allowed in the case of inclusion of 3rd party libraries, which must exist wholly within its own subdirectory and contain appropriate copyright ownership information.

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

So far I have only tested this on Linux (specifically, Debian) and the Windows Subsystem For Linus (WSL) in Windows 10.

### Install the required system packages
At a bare minimum, you need to install the `python` and `sqlite3` packages.   You may also need `build-essential`.
```
apt-get install python sqlite3
```
These are required for the installation of modules that Defiant depends on.  It is not a direct dependency of the code base.

### Run NPM Intall to download the dependencies.
This will take a while...
```
npm install
```

### Ensure that the necessary file directory exists, and has the proper permissions.
By default, Defiant tries to store information in the `/var/defiant` directory.  This will be configurable in the future.  For now, create the directory, and make sure that you have write permissions to the directory.

### Create an index.js with the following contents:
```
const Defiant = require('defiant');

new Defiant.Engine()
  // Add Plugins.
  // The Example Plugin is included with Defiant, and, of course, should not
  // be included in production code.
  .addPlugin(Defiant.Plugin.Example)
  // Explicitly set a directory where Defiant should look for the settings
  // files.  If no files exist, then appropriate defaults will be generated.
  // This directory should be separate from your application code, and
  // preferably under version control.
  .defineBootstrapDirectory('/var/defiant/settings')
  // Initialize the Engine and its components.
  // init() is the last call that should be made, as Defiant will now begin
  // listening for connections.
  .init();
```

### Verify that Defiant is running.
Defiant begins running on port `8888` (this will be configurable in the future), so you should be able to go to `http://localhost:8888` to see the site running.  Look at the console output for the administrator username and password.

## Current State

Defiant doesn't do much at the moment, and isn't ready for serious work at all.  Why?  Because it's still being built, of course!  Parts of it only exist in the minds and conversations of the developers.  If you want to help out, then send us a message and find out what the current roadmap is.

Look at the Roadmap to see what is working, and what is on our immediate radar.  Better yet, contact me and find out how you can jump in and help in the development!

We repeat: This code is not yet intended for any production work whatsoever.

## Disclaimer

Nothing in the API is set in stone, and there's very little official documentation (although we do try to comment the code responsibly).  Furthermore, this is the first draft, and it's not even complete.  When you look at the code, remember this:  There are hacks and TODOs scattered throughout the system.  Sometimes the hack is just to get something working so that some other semi-related part can be fleshed out, and there is an intention to revisit the code later.  Sometimes the TODO is just a stub representing an idea, or indicating where something will need to interface with the system later.  Sometimes, the feature only exists in the minds of the authors.  ESP would be helpful here...

Above all, we encourage you to buck the trends and wisdom of the masses for the hope of a fresh and free coding experience.  If that fails, you can be cranky, too.  Whatever you are, though... **Be Defiant!**
