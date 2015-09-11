'use strict';

/**
 * TODOs
 *
 * 	commands shouldn't store variables outside of actions
 *
 * Requirements
 *
 * - commands must use regex to filter messages
 * - ALL commands must be run through the filter for each message
 */

/**
 * LCTV Bot :)
 */

var debug = process.argv[2] === 'true' || false;
var fs = require('fs');
var credentials = require('./credentials');
var Client = require('./Client');
var Log = require('./Log');
var commandFiles = [];

// Load all files in the commands directory into an array
fs.readdir( './commands' , function( err, files ) {
	if ( err ) {
		console.log( 'ERROR: ' + err );
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
			console.log( 'Skipping command, user: ' + parsedStanza.fromUsername + ' rate limited!' );
		}

		Log.log( JSON.stringify( parsedStanza, null, 4 ) );
	} );
}
