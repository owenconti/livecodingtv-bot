'use strict';

/**
 * This command allows moderators to manage
 * commands via chat instead of via code.
 *
 * Usage:
 *
 * !addcommand COMMAND_NAME OUTPUT
 * !removecommand COMMAND_NAME
 */
const runtime = require('../utils/Runtime');

let addCommandRegex = new RegExp( /^(!|\/)addcommand\s(\w+)\s((.|\n)+)$/ );
let removeCommandRegex = new RegExp( /^(!|\/)removecommand\s(\w+)$/ );
let runCommandRegex = new RegExp( /^(!|\/)(\w+)$/ );

module.exports = [{
	// Run custom command
    types: ['message'],
    regex: runCommandRegex,
    action: function( chat, stanza ) {
		let match = runCommandRegex.exec( stanza.message );
		let command = match[2];
		let customCommands = runtime.brain.get('customCommands') || {};
		let commandValue = customCommands[ command ];

		if ( commandValue ) {
			chat.sendMessage( commandValue );
		}
    }
}, {
	// Add custom command
	name: '!addcommand {command} {output}',
	help: 'Adds a new command to the bot (Mod only).',
    types: ['message'],
    regex: addCommandRegex,
    action: function( chat, stanza ) {
        if ( stanza.user.isModerator() ) {
			let match = addCommandRegex.exec( stanza.message );
			let command = match[2];
			let commandValue = match[3];
			let customCommands = runtime.brain.get('customCommands') || {};

			customCommands[ command ] = commandValue;
			runtime.brain.set( 'customCommands', customCommands );

			chat.replyTo( stanza.user.username, `!${command} added!` );
		}
    }
}, {
	// Remove custom command
	name: '!removecomamnd {command}',
	help: 'Removes a command from the bot (Mod only).',
    types: ['message'],
    regex: removeCommandRegex,
    action: function( chat, stanza ) {
        if ( stanza.user.isModerator() ) {
			let match = removeCommandRegex.exec( stanza.message );
			let command = match[2];
			let customCommands = runtime.brain.get('customCommands') || {};

            // Remove the command from the customCommands object
			delete customCommands[ command ];

			runtime.brain.set( 'customCommands', customCommands );
			chat.replyTo( stanza.user.username, `!${command} removed!` );
		}
    }
}]
