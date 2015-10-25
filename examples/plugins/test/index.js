'use strict';

/**
 * Test plugin example
 *
 * There must be an 'index.js' file for each plugin!
 * Plugins can then require additional files, if needed.
 *
 * Command 1:
 *
 * The first command will respond to any message with
 * with the contents 'test'. The bot will reply with
 * a string: 'I heard test!'.
 *
 * Command 2:
 *
 * The second command is a startup command. It will be called
 * during start up, after connecting to the server.
 * It logs out the string, "Starting the test plugin".
 * You can use startup commands to initialize storage mechanisms,
 * or to connect to APIs, etc, etc.
 */

module.exports = [{
	types: ['message'],
	regex: /^test$/,
	action: function(chat, stanza) {
		chat.sendMessage('I heard test!');
	}
}, {
	types: ['startup'],
	action: function(chat, stanza) {
		console.log( 'Starting the test plugin' );
	}
}];
