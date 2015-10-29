Starting to keep track of changes as of October 28, 2015. I will try my best to keep this file updated.

You can also browse the commit history to track my commits: [https://github.com/owenconti/livecodingtv-bot/commits/master](https://github.com/owenconti/livecodingtv-bot/commits/master)

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
