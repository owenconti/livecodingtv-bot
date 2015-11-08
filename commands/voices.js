'use strict';

module.exports = [{
	name: '!voices',
	help: 'Lists the available voices to be used with the !say command.',
    types: ['message'],
    regex: /^(!|\/)voices/i,
    action: function( chat, stanza ) {
		let voices = `Agnes, Kathy, Princess, Vicki, Victoria, Albert, Alex, Bruce, Fred, Junior, Ralph, Bad News, Bahh, Bells, Boing, Bubbles, Cellos, Deranged, Good News, Hysterical, Pipe Organ, Trinoids, Whisper, Zarvox`;
		chat.replyTo( stanza.user.username, `Available !say voices:\n\n${voices}` );
    }
}];
