'use strict';

/**
 * LCTV Bot :)
 */

var fs = require('fs');
var credentials = require('./credentials');
var Client = require('./Client');
var Log = require('./Log');
var websocket = require('./websocket');
var debug = process.argv[2] === 'debug' || false;
var commandFiles = [];
var websocketCommands = [];
const startUpTime = new Date().getTime();

// Load all files in the commands directory into an array
fs.readdir( './commands' , function( err, files ) {
	if ( err ) {
		Log.log( 'ERROR: ' + err );
	}

	files.forEach( function(fileName) {
		if ( fileName.indexOf( '.js' ) >= 0 ) {
			commandFiles.push( require( './commands/' + fileName ) );
		}
	} );

	startBot();
});

function startBot() {
	// Connect to the server
	var chat = new Client( credentials, debug );

	// Run any startup code for each command
	commandFiles.forEach( function( commandsForFile ) {
		commandsForFile.forEach( function( command ) {
			if ( command.types.indexOf( 'startup' ) >= 0 ) {
				command.action( chat );
			}
			if ( command.types.indexOf( 'websocket' ) >= 0 ) {
				websocketCommands.push( command );
			}
		});
	});

	// Start the websocket server
	websocket.start( websocketCommands, chat );

	// Listen for incoming stanzas
	chat.listen( function( stanza ) {
		// Skip the initial messages when starting the bot
		const messageTime = new Date().getTime();
		if ( messageTime - startUpTime < 5000 ) { // 5 seconds
			Log.log('Skipping start up message');
			return;
		}

		var parsedStanza = Client.parseStanza( stanza, credentials );

		if ( !parsedStanza ) {
			console.log( 'Error parsing stanza: ' + stanza );
			return;
		}

		if ( parsedStanza.rateLimited ) {
			Log.log( 'User: ' + parsedStanza.fromUsername + ' rate limited!' );
		}

		// Run the command through each command file.
		// If the type and the regex match, run the 'action'
		// function of the matching command.
		var ranCommand = false;
		commandFiles.forEach( function( commandsForFile ) {
			commandsForFile.forEach( function( command ) {
				var hasType = command.types.indexOf( parsedStanza.type ) >= 0;
				var regexMatched = command.regex && command.regex.test( parsedStanza.message );
				var ignoreRateLimiting = command.ignoreRateLimiting;
				var passesRateLimiting = !parsedStanza.rateLimited || ( parsedStanza.rateLimited && ignoreRateLimiting );

				if ( hasType && regexMatched && passesRateLimiting ) {
					ranCommand = true;
					command.action( chat, parsedStanza );
				}
			} );
		} );

		// If the user ran a command, update the command log
		if ( ranCommand ) {
			Client.updateLatestCommandLog( parsedStanza );
		}
		Log.log( JSON.stringify( parsedStanza, null, 4 ) );
	} );
}
