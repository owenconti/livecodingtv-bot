'use strict';

module.exports = [{
    types: ['message'],
    regex: /^(!|\/)voices/i,
    action: function( chat, stanza ) {
		var voices = `Agnes, Kathy, Princess, Vicki, Victoria, Albert, Alex, Bruce, Fred, Junior, Ralph, Bad News, Bahh, Bells, Boing, Bubbles, Cellos, Deranged, Good News, Hysterical, Pipe Organ, Trinoids, Whisper, Zarvox`;
		chat.replyTo( stanza.fromUsername, `Available !say voices:\n\n${voices}` );
    }
}];
