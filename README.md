# livecodingtv-bot

# BEFORE YOU BEGIN!
### This node app uses ES6 features.
### Please ensure you are running node v4 or greater!

## Setup

1. Clone the repo

2. Create a `credentials.js` file in the root of the app.

3. Find your XMPP password on LCTV page.
	1. Open your live stream page ( https://www.livecoding.tv/USERNAME )
	2. Open Dev Tools and switch to the Elements tab
	3. Search the HTML content for "password".
	4. The XMPP password will be a long string in an object containing 'jid' and 'password'.

4. Fill in the `credentials.js` file with the following format:

```
var username = 'LCTV_BOT_USERNAME';
var password = 'XMPP_BOT_PASSWORD'; // Found in step 3
var room = 'LCTV_USER_WHERE_BOT_WILL_BE';

module.exports = {
    room: username,
    username: username,
    jid: username + '@livecoding.tv',
    password: password,
    roomJid: room + '@chat.livecoding.tv'
};
```

5. Run `npm install`

6. Run `node index.js`

7. Some commands require extra API keys or specific variables. You can use the `credentials.js` file to store these variables.

```
module.exports = {
    // ...
    password: password,
    roomJid: room + '@chat.livecoding.tv',
	githubRepo: 'owenconti/livecodingtv-bot',
	youtubeApiKey: 'adfadsfsadfasdf'
};
```

8. The bot should be running and waiting for your commands!

## Custom command credentials

#### Github repo command
- Github repo must be publicly available
- Attribute in credentials.js: `githubRepo: 'owenconti/livecodingtv-bot'`

## Using commands
Commands can have four attributes:

```
{
	types: ['message'],
	regex: /^test$/,
	help: 'Returns a confirmation if the `test` message was received.'
	action: function( chat, stanza ) {
		chat.sendMessage( 'Test received!' );
	}
}
```
* types
	* Types must be an array, and can contain multiple types.
	* Valid types are: `message` `presence` `startup` `websocket`
	* `message` types are parsed when an incoming chat message is received
	* `presence` types are parsed when an incoming presence (user joined/left) is received
	* `startup` types are parsed and ran during start up
	* `websocket` types are parsed when an incoming websocket message is received
* regex
	* The `regex` attribute is used to determine the incoming stanza matches the command.
	* If a matched is determined, the action attribute of the command will be run.
	* `regex` must be a valid RegExp object (https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions)
* help
	* The `help` attribute is used generate documentation for the `!help` command.
	* If no `help` attribute is set, no documentation will be generated for the command.
* action
	* The `action` attribute is a function that is called if the `regex` for the command matches.
	* The logic for the command should reside inside the `action` attribute.
	* `action` is passed 2 parameters:
		1. `chat` - an instance of the Client object
		2. `stanza` - the parsed stanza containing:
		```
		{
			user: User object,
			message: message string,
			type: type of stanza (message or presence)
			rateLimited: boolean to determine if the user is rateLimited
		}
		```
	* The `stanza` parameter is not passed to `startup` commands.
