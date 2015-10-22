'use strict';

/**
 * LCTV Bot :)
 */

var fs = require('fs');
var credentials = require('./credentials');
var Client = require('./Client');
var Log = require('./Log');
var debug = process.argv[2] === 'debug' || false;
var commandFiles = [];
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

	chat.listen( function( stanza ) {
		// Skip the initial messages when starting the bot
		const messageTime = new Date().getTime();
		if ( messageTime - startUpTime < 5000 ) { // 5 seconds
			Log.log('Skipping start up message');
			return;
		}

		var parsedStanza = Client.parseStanza( stanza );
		if ( !parsedStanza.rateLimited ) {
			commandFiles.forEach( function( commandsForFile ) {
				commandsForFile.forEach( function( command ) {
					var hasType = command.types.indexOf( parsedStanza.type ) >= 0;
					var regexMatched = command.regex.test( parsedStanza.message );

					if ( hasType && regexMatched ) {
						command.action( chat, parsedStanza );
					}
				} );
			} );
		} else {
			Log.log( 'Skipping command, user: ' + parsedStanza.fromUsername + ' rate limited!' );
		}

		Log.log( JSON.stringify( parsedStanza, null, 4 ) );
	} );
}
