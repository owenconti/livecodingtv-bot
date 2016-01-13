Starting to keep track of changes as of October 28, 2015. I will try my best to keep this file updated.

You can also browse the commit history to track my commits: [https://github.com/owenconti/livecodingtv-bot/commits/master](https://github.com/owenconti/livecodingtv-bot/commits/master)

## Jan 12 2016
* Possibly fixed issue with bot disconnecting after a certain period of time without sending a message to the server.
* Updated default enabled commands to disable `unavailable` and `greeting` command.
  * If you want to use either of these commands, please make sure you updated your `setup/custom/settings.json` file.
* No longer greet the bot or the streamer in the `greeting` command.
* Replaced Pastebin with Gist for help documentation and youtube playlist track output.
  * **Required update**
  * Delete your `help` brain file before starting up.
  * Update the `youtube` plugin to latest from repo, if you use that command.
  * Setup your Gist/Github access token in `credentials.js`
    ```
	{
		"gistUsername" : "owenconti",
		"gistAccessToken" : "ajskfnasdifhj98y3129uncawdf"
	}
	```

## Nov 7 2015
* Added a setting for the `unavailable` command to enable/disable the command.
* Added a `setsubject` command, to set the room's subject via XMPP.
* Added the ability to pass a settings object to the `client.js` code of plugins.
* Updated `help` command to output a link to Pastebin when called.
* When the bot starts, it will generate and store the documentation for help in a Paste on pastebin.com.
* Greetings are now run through a templater with `username` and `status` variables being passed-in.

## Nov 5 2015
* Say command messages limit increased to 80 characters.
* Added a Say message to the ban command.
* Decreased ban flyout duration to 6 seconds from 10 seconds.
* Case-insensitive command matching (assuming all commands register their regex in lowercase).
* Added setting to customize the on-ban say message.
* Added setting to enable/disable the Say utility.
* Added the loadUrl function to the Assets utility class.

## Nov 4 2015
* Updated ban management to display the ban police image when a user is banned.

## Nov 2 2015
* Replaced node-xmpp with node-xmpp-client.
  * **Required update**
  * You must run `npm install` after pulling this change.
* Hopeful fix for the brain to stop it from erasing files when an error occurs.
* Removed public.html and replaced with the `/client` folder.
* To run the new client page:
  * Make sure the bot is running
  * Open a new terminal window and navigate to `/client`
  * Run `python -m SimpleHTTPServer {PORT}`
  * Navgiate to `localhost:{PORT}/#{USERNAME}`
  * The websocket connection should happen, any plugin code should be loaded, and then the client page should be ready to go.
* Setup plugins to register themselves for the client page.
* Moved playlist.js command to a `youtube` plugin.
  * **Required update**
  * If you used the playlist.js command, you will need to install the plugin to use it.
  * Ensure you have a `settings.json` file in the `youtube` folder. The structure should be:
	```
	{
		"youtubeApiKey" : "aisjdoi12masdasd",
		"requiredVotesToSkip" : 3
	}
	```
* Removed the doge flyout from the `say` command. Will come back soon as part of the flyouts plugin.

## Oct 31 2015
* Fixed error with Client.js getUser() where it would crash when no `users` brain file existed.

## Oct 29 2015
* Updated pattern for `Templater` class to use '{{VAR}}' instead of '${VAR}'.
  * **Required update**
  * If you are using the `Templater` class, make sure your template strings use the '{{VAR}}' pattern.
* Removed the `upcoming` playlist command
* Updated `skip` playlist command to be random
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
