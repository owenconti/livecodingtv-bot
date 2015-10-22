'use strict';

var say = require('say');
var voice = 'Victoria';
var Log = require('../Log');
var regex = new RegExp( /^(!|\/)say\s(.+)$/ );

module.exports = [{
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        // Parse the message from the command,
        // limit !say message to 50 chars
        var message = regex.exec( stanza.message )[2];
		message = message.substr( 0, 50 );

        // Allow users to override the voice
        var match = /^\-voice\s(\w+)\s(.+)/.exec( message );
        if ( match ) {
            voice = match[1];
            message = match[2];
        }

		if ( chat.debug ) {
			Log.log('DEBUGGING (say): ' + message);
			return false;
		}

        say.speak( voice, message );
    }
}];
