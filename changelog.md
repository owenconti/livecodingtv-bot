Starting to keep track of changes as of October 28, 2015. I will try my best to keep this file updated.

You can also browse the commit history to track my commits: [https://github.com/owenconti/livecodingtv-bot/commits/master](https://github.com/owenconti/livecodingtv-bot/commits/master)

## Oct 29 2015
* Fixed auto ban command
* Changed how user messages are stored.
  * **Required update**
  * If you depended on userMessages, you should clear your userMessages brain file because the structure has changed.
* Assets now load custom assets, and then core assets.
* Rearranged setup folder so it makes more sense.
* Updated the Loader class to read settings files to determine which commands and plugins it should load.
  * **Required update**
  * By default, all core commands are enabled.
  * By default, all plugins are disabled.
  * You must add a `coreCommands` and `plugins` setting to your `setup/custom/settings.json` file if you want to enable or disable commands and plugins.
* Fixed bug with `greeting` command where an existing user with a status that did not have a matching greeting, was not greeted.
  * **Required update**
  * If you had any custom greetings, you will need to update to the new greeting structure. See `setup/core/settings.json` for an example.

### New Format

* Updated Loader to allow bot to start without a `/plugins` directory.
* Verifying credentials.js includes the required attributes to start up when starting the bot.
* Moved a couple classes into the `utils` directory.
  * If you required any of the following files, you will need to update your references:
    * `ChatBot.js`
	* `Client.js`
	* `Loader.js`
	* `websocket.js`
* Created a `Settings.js` utility file, to easily load settings.
* Created a `setup` directory, and started a `defaultSettings.json` file to keep default settings.
* Moved `credentials.js` into the `setup` directory.
  * If you required `credentials.js`, you will need to update your references.
* Added available statuses to the default settings
* Added `hasStatus` to User model to easily check for a specific status
* Updated various commands to pull from default settings file
* Added `Templater` class, to build strings from a template
* Added `Assets` class, to load assets into the bot
* Updated say command to display a popout doge when !say is used
