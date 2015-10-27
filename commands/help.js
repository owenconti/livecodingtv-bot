'use strict';

const runtime = require('../utils/Runtime');

module.exports = [{
	name: '!help',
	help: 'Lists the availabe commands.',
    types: ['message'],
    regex: /^(!|\/)(help|commands)$/,
    action: function( chat, stanza ) {
		var output = '';

		// Loop through the core message customCommands
		output += 'Core commands:' + '\n';
		runtime.coreCommands.message.forEach( ( command ) => {
			if ( command.name && command.help ) {
				output += command.name + ' - ' + command.help + '\n';
			}
		} );

		// Loop through the core message customCommands
		output += '\nPlugin commands:' + '\n';
		let pluginCommands = runtime.pluginCommands.message;
		if ( pluginCommands.length === 0 ) {
			output += 'No plugin commands available.\n';
		} else {
			pluginCommands.forEach( ( command ) => {
				if ( command.name && command.help ) {
					output += command.name + ' - ' + command.help + '\n';
				}
			} );
		}

		// Get our custom commands
		let customCommands = runtime.brain.get('customCommands') || {};
		let customCommandKeys = Object.keys( customCommands );
		if ( customCommandKeys.length > 0 ) {
			output += '\nCustom commands:\n';
			customCommandKeys.forEach( ( command ) => {
				output += '\n!' + command;
			} );
		}

        chat.sendMessage( output );
    }
}]
