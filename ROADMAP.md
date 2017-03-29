# Defiant Project Roadmap

**Defiant** has a complicated mission.  We are trying to assemble many unique projects into a common framework.  We are starting from scratch and bootstrapping it as we go.  That means that things that should be here aren't yet, and things that are indispensible we haven't even gotten around to stubbing out yet!

This document is a mini-roadmap so that you can jump in and know where we need help in development.  We will also try to include implementation notes so that you can see the direction we are striving for (although, like any complicated project, the details will probably change as we progress).

The things in this list are not in any particular order, although some may not be possible until other items on the list are somewhat functional.  If you see something that you want to work on, however, there is nothing stopping you from working on anything that interests you!

## What works

1. The Router properly identifies the applicable route(s) for the given URL, incluing wildcard matching.
2. The Form API (FAPI) correctly handles validation and cryptographic signing, as discussed [here](https://cscrunch.com/node/18).
3. The Session API works so far as it gives the user an encrypted cookie, and recovers the user session from disk if not already in memory.  It supports session expiration, too.
4. The Settings API is under way, with the user able to change the directories used to store Settings Data objects.  The user can also change the Storage class for different data points.
5. The Theme system is being developed, so that additional themes can be enabled in a plug-and-play transparency.
6. Various utility functions are written.
7. An Example plugin shows the basics of use with the FAPI and Router.
8. There is *some* test coverage (mostly the utility functions).
9. For the moment, a sqlite3 database is used, but will soon be replaced withh a generic database abstraction.
10. A Rudimentary ORM is in place.  It has a concept of Tables, Entities, and Attributes.  Entities are assembled by adding Attributes (e.g., text fields, numbers, etc.).  Attributes can have sub-attributes for many levels.  The Entity table is not revisioned (it should only keep static identity data).  All data about an Entity that can change should be put into an Attribute.  All Attributes support revisions.  All Attributes can have a many-to-one relationship with the Entity; it is up to the code to control the number of Attributes allowed in a single revision.
11. The "Message" functionality has been implemented, so that Error, Warning, Informational, etc. messages can be shown to the user.  Messages are added to the Themed page output.  Messages are stored in an in-memory-only, volitile session variable, so as to persist across page loads.
12. A default admin user is created (if it doesn't already exist).
13. User login works, with persistance through Sessions.  User logout & password change also work.
14. Serving files from directories is now supported.  This allows for mapping of arbitrary paths to specific directories, which is necessary for HTML inclusion of Plugin-provided HTML, CSS, & JavaScript.
15. Context now has Javascript and CSS Registries, so that plugins can add JS & CSS to a page load.
16. JQuery is included by default by the base theme.

## TODO

1. Database Abstraction class using [node-sql](https://github.com/brianc/node-sql).
  * Default to [sqlite3](https://github.com/mapbox/node-sqlite3).
  * In the future, the 1st run of Defiant will create an in-memory sqlite3 database.
    * The user will then choose the actual database setup (file location if sqlite3, or db connection info).
    * Defiant will save the setup into a bootstrap variable, and migrate the database.
  * Support database schema versioning and upgrading.
2. User login
  * The admin user (if not found in the database), should be generated automatically and the password output via `console.log()`.
3. Router
  * Router items should support validation.
  * Logic needs to be decided on for multiple router items responding to a request (later items may need to modify the structure created by previous items!).
  * Support for serving static files.
    * Plugins must be able to provide their own resource files (javascript, images, css, etc.)
    * These files should be servable securely from the plugin directory by explicit listing of files.
4. HTTP
  * Consider doing away with the Connect module altogether, since HTTP serves the same purpose.
5. Widgets
  * Widgets are analogous to Drupal blocks.  They may be forms, lists, menus, or any other information that needs to appear on a page, but that may not be the main content of that page.
6. Layout
  * A Layout engine should wrap the `content` of "themed" pages.  Layouts should be defined flexibly, and provide drag-and-drop addition of widgets.
7. Theme
  * A default Bootstrap theme would be nice.
8. Messaging System
  * We need a way for Plugins to communicate messages to the user.
  * The "Message box" will probably be a Widget so that it can be moved around the page as needed.
9. JS/CSS Inclusion
  * At any time during the router handling, other plugins should be able to add JS and CSS files as needed.
  * Support JS and CSS minification (if possible).
  * Perhaps a type of library support, too (e.g., D3, when needed).
10. Menu system
  * Plugins need a way to declare that some routes are intended to be menu items.
  * Types of menus are:
    * Static (always appear regardless of current page)
    * Contextual (only appear when their path can be generated from the URL of the current page)
  * Links should not appear if the user does not have access to that page.
11. Internationalization
  * Stub out support for translation based on context.
  * Figure out where to go from here...
12. File API
  * When files are uploaded, they should be tracked by the system.  They may be transferred to other file systems.
  * FTP
  * S3 (and related)
13. Logging/Data Store
  * There are 3 types of data in the system:
    * Database (relational data)
    * File-based settings (Settings plugin)
    * Logs (data that should be stored, but not necessarily indexed)
      * Possibly emulate logrotate behavior
      * Possibly track log files with the File API (would make it easy to backup logs to offsite storage, for example!)
14. Sockets
  * Now we're talking... *this* is what Node.js is good for!
  * Needs same authentication mechanism as HTTP.
  * Some example/demo plugin would be nice... perhaps the beginnings of a Slack clone or WebRTC client?
15. Other Plugin discovery
  * It would be nice if Defiant could discover other Defiant-compatible modules (plugins) that have been installed either locally or globally.
  * This would make UI-based management of the engine very nice!
16. UI-based Views creation
  * A powerful feature available in Drupal, but that could be made much nicer in a Node.js-based implementation.
  * Lots of ideas, but this on is a biggie, and is further down the road.
17. WYSIWYG
  * Supporting a WYSIWYG editor
  * In-place editing would be nice.
  * Perhaps supporting input formats such as Markdown as well as HTML.
18. Multi-engine communication.
  * An important step on the roadmap.
  * Multiple engines could communicate with one another to pass along file-based settings changes (presumably databases will be synchronizing themselves?).
19. CMS
  * This is not the main goal of Defiant, but it is a practical use case, as CMS features may be useful to many types of other plugins.
20. E-Commerce
  * It's a long-term goal, but it would be important as many people are looking for this type of service these days.
21. World Domination.
  * Because.
