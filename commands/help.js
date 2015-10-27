'use strict';

const runtime = require('../utils/Runtime');

module.exports = [{
	name: '!help',
	help: 'Lists the availabe commands.',
    types: ['message'],
    regex: /^(!|\/)(help|commands)$/,
    action: function( chat, stanza ) {
		let output = `Available !help commands:

!help core - Lists the core commands.
!help plugins - Lists the plugins commands.
!help custom - Lists the custom commands.`;
		chat.sendMessage( output );
    }
}, {
	name: '!help core',
	help: 'Lists the availabe core commands.',
    types: ['message'],
    regex: /^(!|\/)(help|commands)\s(core)$/,
    action: function( chat, stanza ) {
		var output = '';
		var commandsCount = 0;

		runtime.coreCommands.message.forEach( ( command ) => {
			if ( command.name && command.help ) {
				if ( commandsCount === 0 ) {
					output = 'Core commands:\n';
				}
				output += '\n' + command.name + '\n';
				output += command.help + '\n';
				commandsCount++;

				if ( commandsCount === 10 ) {
					chat.sendMessage( output );
					commandsCount = 0;
				}
			}
		} );
		chat.sendMessage( output );
    }
}, {
	name: '!help plugins',
	help: 'Lists the availabe plugin commands.',
    types: ['message'],
    regex: /^(!|\/)(help|commands)\s(plugins)$/,
    action: function( chat, stanza ) {
		var output = '';
		var commandsCount = 0;

		// Loop through the core message customCommands
		let pluginCommands = runtime.pluginCommands.message;
		if ( pluginCommands.length > 0 ) {
			commandsCount = 0;
			pluginCommands.forEach( ( command ) => {
				if ( command.name && command.help ) {
					if ( commandsCount === 0 ) {
						output = 'Plugin commands:\n';
					}
					output += '\n' + command.name + '\n';
					output += command.help + '\n';
					commandsCount++;

					if ( commandsCount === 10 ) {
						chat.sendMessage( output );
						commandsCount = 0;
					}
				}
			} );
		} else {
			output = 'No plugin commands available.';
		}
		chat.sendMessage( output );
    }
}, {
	name: '!help custom',
	help: 'Lists the availabe custom commands.',
    types: ['message'],
    regex: /^(!|\/)(help|commands)\s(custom)$/,
    action: function( chat, stanza ) {
		var output = '';
		var commandsCount = 0;

		// Get our custom commands
		let customCommands = runtime.brain.get('customCommands') || {};
		let customCommandKeys = Object.keys( customCommands );
		if ( customCommandKeys.length > 0 ) {
			commandsCount = 0;
			customCommandKeys.forEach( ( command ) => {
				if ( commandsCount === 0 ) {
					output = 'Custom commands:\n';
				}
				output += '\n!' + command;
				commandsCount++;

				if ( commandsCount === 10 ) {
					chat.sendMessage( output );
					commandsCount = 0;
				}
			} );
		}
        chat.sendMessage( output );
    }
}]
