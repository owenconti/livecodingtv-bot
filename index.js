'use strict';

/**
 * LCTV Bot :)
 */

const fs = require('fs');
const credentials = require('./credentials');
const websocket = require('./websocket');
const Client = require('./Client');
const Log = require('./utils/Log');
const Brain = require('./utils/Brain');

let runtime = require('./utils/Runtime');
runtime.debug = process.argv[2] === 'debug' || false;
runtime.commandFiles = [];
runtime.websocketCommands = [];
runtime.startUpTime = new Date().getTime();
runtime.credentials = credentials;
runtime.brain = Brain;

Brain.start( __dirname + '/brain' );

// Load all files in the commands directory into an array
fs.readdir( './commands' , function( err, files ) {
	if ( err ) {
		Log.log( 'ERROR: ' + err );
	}

	files.forEach( function(fileName) {
		if ( fileName.indexOf( '.js' ) >= 0 ) {
			runtime.commandFiles.push( require( './commands/' + fileName ) );
		}
	} );

	startBot();
});

function startBot() {
	// Connect to the server
	let chat = new Client( credentials );

	// Run any startup code for each command
	runtime.commandFiles.forEach( function( commandsForFile ) {
		commandsForFile.forEach( function( command ) {
			if ( command.types.indexOf( 'startup' ) >= 0 ) {
				command.action( chat );
			}
			if ( command.types.indexOf( 'websocket' ) >= 0 ) {
				runtime.websocketCommands.push( command );
			}
		});
	});

	// Start the websocket server
	websocket.start( chat );

	// Listen for incoming stanzas
	chat.listen( function( stanza ) {
		// Skip the initial messages when starting the bot
		const messageTime = new Date().getTime();
		if ( messageTime - runtime.startUpTime < 5000 ) { // 5 seconds
			Log.log('Skipping start up message');
			return;
		}

		var parsedStanza = Client.parseStanza( stanza, credentials );
		if ( !parsedStanza ) {
			return;
		}
		if ( parsedStanza.rateLimited ) {
			Log.log( 'User: ' + parsedStanza.user.username + ' rate limited!' );
		}

		// Run the command through each command file.
		// If the type and the regex match, run the 'action'
		// function of the matching command.
		var ranCommand = false;
		runtime.commandFiles.forEach( function( commandsForFile ) {
			commandsForFile.forEach( function( command ) {
				try {
					var hasType = command.types.indexOf( parsedStanza.type ) >= 0;
					var regexMatched = command.regex && command.regex.test( parsedStanza.message );
					var ignoreRateLimiting = command.ignoreRateLimiting;
					var passesRateLimiting = !parsedStanza.rateLimited || ( parsedStanza.rateLimited && ignoreRateLimiting );

					if ( hasType && regexMatched && passesRateLimiting ) {
						ranCommand = true;
						command.action( chat, parsedStanza );
					}
				} catch ( e ) {
					console.trace( 'ERROR', e );
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
