'use strict';

/**
 * TODOs
 *
 * Write when people leave? or become unavailable
 *
 * Requirements
 *
 * - commands must use regex to filter messages
 * - ALL commands must be run through the filter for each message
 */

/**
 * LCTV Bot :)
 */
var fs = require('fs');
var credentials = require('./credentials');
var Client = require('./Client');
var commands = [];

// Load all files in the commands directory into an array
fs.readdir( './commands' , function( err, files ) {
	if ( err ) {
		console.log( 'ERROR: ' + err );
	}

	files.forEach( function(fileName) {
		if ( fileName.indexOf( '.js' ) >= 0 ) {
			commands.push( require( './commands/' + fileName ) );
		}
	} );

	startBot();
});

function startBot() {
	// Connect to the server
	var chat = new Client( credentials.jid, credentials.password, credentials.username, credentials.roomJid );

	chat.listen( function( stanza ) {
		var parsedStanza = Client.parseStanza( stanza );

		commands.forEach( function( command ) {
			var hasType = command.types.indexOf( parsedStanza.type ) >= 0;
			var regexMatched = command.regex.test( parsedStanza.message );

			if ( hasType && regexMatched ) {
				command.action( chat, parsedStanza );
			}
		} );

		console.log( JSON.stringify( parsedStanza, null, 4 ) );
	} );
}
