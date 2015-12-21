'use strict';

const runtime = require('../utils/Runtime');
const Log = require('../utils/Log');
const Pastebin = require('../utils/Pastebin');

module.exports = [{
    types: ['startup'],
    action: function( chat ) {
        let helpObject = runtime.brain.get('help') || {
            link: '',
            documentation: ''
        };

        // Generate help documentation
        let newDocumentation = generateHelpDocumentation();

        // Compare new documentation agianst the brain's stored documentation
        if ( newDocumentation === helpObject.documentation ) {
            Log.log('[help] Help documentation unchanged, not creating a Paste.');
            return;
        }

        Pastebin.createPaste( `${runtime.credentials.username} - LCTV Bot Help Documentation`, newDocumentation, (link) => {
            helpObject.link = link;
            helpObject.documentation = newDocumentation;
            runtime.brain.set( 'help', helpObject );
        } );
    }
}, {
	name: '!help',
	help: 'Shows the documentation for core, plugins, and custom commands.',
    types: ['message'],
    regex: /^(!|\/)(help|commands)$/,
    action: function( chat, stanza ) {
        let helpObj = runtime.brain.get('help');
        let output = 'No help documentation generated.';

        if ( helpObj.link ) {
            output = `Help documentation can be found at this Paste: ${ helpObj.link }`;
        }
		chat.sendMessage( output );
    }
}];

/**
 * Generates the entire help documentation into a giant string.
 * @return {String}
 */
function generateHelpDocumentation() {
    Log.log('[help] Generating help documentation');

    // Core commands
    let output = 'CORE COMMANDS:\n';

    runtime.coreCommands.message.forEach( ( command ) => {
        if ( command.name && command.help ) {
            output += '\n' + command.name + '\n';
            output += command.help + '\n';
        }
    } );

    // Plugin commands
    output += '\n\nPLUGIN COMMANDS:\n';

    // Loop through the core message customCommands
    let pluginCommands = runtime.pluginCommands.message;
    if ( pluginCommands.length > 0 ) {
        pluginCommands.forEach( ( command ) => {
            if ( command.name && command.help ) {
                output += '\n' + command.name + '\n';
                output += command.help + '\n';
            }
        } );
    } else {
        output = 'No plugin commands available.';
    }

    // Custom commands
    output += '\n\nCUSTOM COMMANDS:\n';

    // Get our custom commands
    let customCommands = runtime.brain.get('customCommands') || {};
    let customCommandKeys = Object.keys( customCommands );
    if ( customCommandKeys.length > 0 ) {
        customCommandKeys.forEach( ( command ) => {
            output += '\n!' + command;
        } );
    } else {
        output += 'No custom commands available.';
    }

    Log.log('[help] Help documentation generated');

    return output;
}
