'use strict';

const xmpp = require('node-xmpp-client');
const Assets = require('../utils/Assets');
const Websocket = require('../utils/Websocket');
const Say = require('../utils/Say');

/**
 * Returns a stanza to send to the server.
 * @param  {string} affiliation
 * @return {Stanza}
 */
var getUserAffiliationStanza = function( credentials, nickname, affiliation ) {
	var stanza = new xmpp.Stanza('iq', {
		from: credentials.jid,
		id: '12:sendIQ',
		to: credentials.roomJid,
		type: 'set',
		xmlns: 'jabber:client'
	})
	.c('query', { xmlns: 'http://jabber.org/protocol/muc#admin' })
	.c('item', { affiliation: affiliation, jid: nickname + '@livecoding.tv' });

	return stanza;
};

const unbanRegex = new RegExp( /^(!|\/)unban\s(\w+)$/ );
const banRegex = new RegExp( /^(!|\/)ban\s(\w+)$/ );

module.exports = [{
	// Auto ban users flood messages to the chat
	types: ['message'],
    regex: /./,
	ignoreRateLimiting: true,
    action: function( chat, stanza ) {
		const numberOfMessagesAllowed = 5;
		const timeframeAllowed = 10; // seconds

		// Never auto ban the streamer or the bot
		if ( stanza.user.isStreamer() || stanza.user.isBot() ) {
			return;
		}

		let userMessageLog = stanza.user.getMessages();
		if ( userMessageLog ) {
			let messages = userMessageLog.messages;
			// If the user has sent at least the number of messages allowed
			if ( messages.length > numberOfMessagesAllowed ) {
				const now = new Date().getTime();

				let startOfLimitMessage = messages[ messages.length - numberOfMessagesAllowed ];

				// If the number of allowed messages sent by the user (ie: 5th)
				// was sent within the last X seconds (timeframeAllowed),
				// ban the user.
				if ( now - startOfLimitMessage.time < ( timeframeAllowed * 1000 ) ) {
					banUser( stanza.user.username, chat );
				}
			}
		}

    }
}, {
	name: '!unban',
	help: 'Unbans the specified user.',
	types: ['message'],
    regex: unbanRegex,
    action: function( chat, stanza ) {
		if ( stanza.user.isModerator() ) {
			var match = unbanRegex.exec( stanza.message );
			var userToUnban = match[2];

			var affiliationStanza = getUserAffiliationStanza( chat.credentials, userToUnban, 'none' );
			chat.client.send( affiliationStanza );

			chat.sendMessage( '@' + userToUnban + ' has been unbanned!' );
		}
    }
}, {
	name: '!ban',
	help: 'Bans the specified user.',
    types: ['message'],
    regex: banRegex,
    action: function( chat, stanza ) {
		if ( stanza.user.isModerator() ) {
			let match = banRegex.exec( stanza.message );
			let userToBan = match[2];

			banUser( userToBan, chat );
		}
    }
}];

function banUser( username, chat ) {
    var affiliationStanza = getUserAffiliationStanza( chat.credentials, username, 'outcast' );
    chat.client.send( affiliationStanza );

    Assets.load( 'ban-police.png', function(base64Image) {
        let htmlContent = `
<div>
    <span style="color: #000;
    font-size: 50px;
    position: absolute;
    left: 30px;
    top: 55px;
    font-family: Arial;
    text-transform: uppercase;
    display: block;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 440px;
    padding: 0.5em 0;">${ username }</span>
    <img src="data:image/png;base64,${base64Image}"  />
</div>
`;
        Websocket.sendMessage( chat.credentials.room, {
            message: 'flyout',
            type: 'div',
            content: htmlContent,
            duration: 6000,
            animation: 'flyLeft'
        });
        Say.say(`${username} You are banned for being a douche`, 'Daniel' );
    });
}
