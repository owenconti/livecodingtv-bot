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
let addCommandRegex = new RegExp( /^(!|\/)addcommand\s(\w+)\s((.|\n)+)$/ );
let removeCommandRegex = new RegExp( /^(!|\/)removecommand\s(\w+)$/ );
let runCommandRegex = new RegExp( /^(!|\/)(\w+)$/ );

module.exports = [{
	// Run custom command
    types: ['message'],
    regex: runCommandRegex,
    action: function( chat, stanza ) {
		var match = runCommandRegex.exec( stanza.message );
		var command = match[2];
		var customCommands = chat.getSetting('customCommands') || {};
		var commandValue = customCommands[ command ];

		if ( commandValue ) {
			chat.sendMessage( commandValue );
		}
    }
}, {
	// Add custom command
    types: ['message'],
    regex: addCommandRegex,
    action: function( chat, stanza ) {
		var user = chat.getUser( stanza.fromUsername );
        if ( user.role === 'moderator' ) {
			var match = addCommandRegex.exec( stanza.message );
			var command = match[2];
			var commandValue = match[3];

			var customCommands = chat.getSetting('customCommands') || {};
			customCommands[ command ] = commandValue;
			chat.saveSetting( 'customCommands', customCommands );

			chat.replyTo( stanza.fromUsername, `!${command} added!` );
		}
    }
}, {
	// Remove custom command
    types: ['message'],
    regex: removeCommandRegex,
    action: function( chat, stanza ) {
		var user = chat.getUser( stanza.fromUsername );
        if ( user.role === 'moderator' ) {
			var match = removeCommandRegex.exec( stanza.message );
			var command = match[2];

			var customCommands = chat.getSetting('customCommands') || {};
			delete customCommands[ command ];
			chat.saveSetting( 'customCommands', customCommands );

			chat.replyTo( stanza.fromUsername, `!${command} removed!` );
		}
    }
}]
