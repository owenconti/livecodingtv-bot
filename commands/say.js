var say = require('say');
var voice = 'Victoria';
var regex = new RegExp( /^(!|\/)say\s(.+)$/ );

module.exports = [{
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        // Parse the message from the command
        var message = regex.exec( stanza.message )[2];

        // Allow users to override the voice
        var match = /^\-voice\s(\w+)\s(.+)/.exec( message );
        if ( match ) {
            voice = match[1];
            message = match[2];
        }

        say.speak( voice, message );
    }
}];
