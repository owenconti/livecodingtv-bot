'use strict';

const request = require('request');
const runtime = require('../utils/Runtime');
const Log = require('../utils/Log');
const apiKey = 'c768c168d9bc885941e2e67e9cd8ad82';

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

        // Post the documentation to pastebin
        Log.log('[help] Creating a new post on pastebin');
        let requestOpts = {
            url: 'http://pastebin.com/api/api_post.php',
            form : {
                api_dev_key: apiKey,
                api_option: 'paste',
                api_paste_code : newDocumentation,
                api_paste_name: `${runtime.credentials.username} - LCTV Bot Help Documentation`
            }
        };
        request.post( requestOpts, ( err, response, body ) => {
            if ( err ) {
                console.log( 'Error creating TextUploader post: ' + err );
            }

            Log.log('[help] Pastebin post created', body);

            helpObject.link = body;
            helpObject.documentation = newDocumentation;
            runtime.brain.set( 'help', helpObject );
        } );
    }
}, {
	name: '!help',
	help: 'Lists the availabe commands.',
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
