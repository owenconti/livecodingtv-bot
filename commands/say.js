'use strict';

const Settings = require('../utils/Settings');
const defaultVoice = Settings.getSetting( __filename, 'defaultVoice' );
const Say = require('../utils/Say');
const Assets = require('../utils/Assets');
const websocket = require('../utils/websocket');
const regex = new RegExp( /^(!|\/)say\s(.+)$/ );

module.exports = [{
	name: '!say {[-voice VoiceName]} {message}',
	help: 'Verbally speaks a message.',
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        // Parse the message from the command,
        // limit !say message to 50 chars
        var message = regex.exec( stanza.message )[2];
		message = message.substr( 0, 50 );

        // Allow users to override the voice
        var voice = defaultVoice;
        var match = /^\-voice\s(\w+)\s(.+)/.exec( message );
        if ( match ) {
            voice = match[1];
            message = match[2];
        }

		// Send a doge.png whenever a !say is used
		Assets.load('doge.png', function(base64Image) {
			websocket.sendMessage( chat.credentials.room, {
				message: 'showImage',
				image: base64Image
			});
		});

        Say.say( message, voice );
    }
}];
