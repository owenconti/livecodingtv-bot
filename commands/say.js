'use strict';

const Say = require('../utils/Say');
const regex = new RegExp( /^(!|\/)say\s(.+)$/ );

module.exports = [{
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        // Parse the message from the command,
        // limit !say message to 50 chars
        var message = regex.exec( stanza.message )[2];
		message = message.substr( 0, 50 );

        // Allow users to override the voice
        var voice = 'Victoria';
        var match = /^\-voice\s(\w+)\s(.+)/.exec( message );
        if ( match ) {
            voice = match[1];
            message = match[2];
        }

        Say.say( message, voice );
    }
}];
