'use strict';

const runtime = require('../utils/Runtime');
const Log = require('../utils/Log');
const Gist = require('../utils/Gist');

module.exports = [{
    types: ['startup'],
    action: function( chat ) {
        let helpObject = runtime.brain.get('help') || {
            id: '',
            documentation: ''
        };

        // Generate help documentation
        let newDocumentation = generateHelpDocumentation();

        // Compare new documentation agianst the brain's stored documentation
        if ( newDocumentation === helpObject.documentation ) {
            Log.log('[help] Help documentation unchanged, not creating a Gist.');
            return;
        }

        if ( helpObject.id === '' ) {
            Log.log('[help] Creating new help documentation');

            Gist.createGist( `${runtime.credentials.username} - LCTV Bot Help Documentation`, newDocumentation, (gistID) => {
                helpObject.id = gistID;
                helpObject.documentation = newDocumentation;
                runtime.brain.set( 'help', helpObject );
            } );
        } else {
            Log.log('[help] Updating existing help documentation');

            Gist.updateGist( helpObject.id, newDocumentation, (gistID) => {
                helpObject.id = gistID;
                helpObject.documentation = newDocumentation;
                runtime.brain.set( 'help', helpObject );
            } );
        }
    }
}, {
	name: '!help',
	help: 'Shows the documentation for core, plugins, and custom commands.',
    types: ['message'],
    regex: /^(!|\/)(help|commands)$/,
    action: function( chat, stanza ) {
        let helpObj = runtime.brain.get('help');
        let output = 'No help documentation generated.';

        if ( helpObj && helpObj.id ) {
            output = `Help documentation can be found at this Gist: ${ Gist.getGistLink(helpObj.id) }`;
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
    let output = '## Core Commands\n';

    runtime.coreCommands.message.forEach( ( command ) => {
        if ( command.name && command.help ) {
            output += `### ${command.name}\n`;
            output += command.help + '\n\n';
        }
    } );

    // Plugin commands
    output += '## Plugin Commands\n';

    // Loop through the core message customCommands
    let pluginCommands = runtime.pluginCommands.message;
    if ( pluginCommands.length > 0 ) {
        pluginCommands.forEach( ( command ) => {
            if ( command.name && command.help ) {
                output += `### ${command.name}\n`;
                output += command.help + '\n\n';
            }
        } );
    } else {
        output += '\nNo plugin commands available.\n';
    }

    // Custom commands
    output += '## Custom Commands\n';

    // Get our custom commands
    let customCommands = runtime.brain.get('customCommands') || {};
    let customCommandKeys = Object.keys( customCommands );
    if ( customCommandKeys.length > 0 ) {
        customCommandKeys.forEach( ( command ) => {
            output += '\n\n!' + command;
        } );
    } else {
        output += 'No custom commands available.';
    }

    Log.log('[help] Help documentation generated');

    return output;
}
