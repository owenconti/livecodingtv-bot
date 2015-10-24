'use strict';

var xmpp = require('node-xmpp');

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
		if ( stanza.fromUsername === chat.credentials.username || stanza.fromUsername === chat.credentials.room ) {
			return;
		}

		let messages = chat.getSetting( 'userMessages' ) || {};
		let userMessageLog = messages[ stanza.fromUsername ];
		let userMessageTimes = userMessageLog.messageTimes;

		// If the user has sent at least the number of messages allowed
		if ( userMessageTimes.length > numberOfMessagesAllowed ) {
			const now = new Date().getTime();
			let limitedMessageTime = userMessageTimes[ userMessageTimes.length - numberOfMessagesAllowed ];

			// If the number of allowed messages sent by the user (ie: 5th)
			// was sent within the last X seconds (timeframeAllowed),
			// ban the user.
			if ( now - limitedMessageTime < ( timeframeAllowed * 1000 ) ) {
				var affiliationStanza = getUserAffiliationStanza( chat.credentials, stanza.fromUsername, 'outcast' );
				chat.client.send( affiliationStanza );
			}
		}
    }
}, {
    types: ['message'],
    regex: unbanRegex,
    action: function( chat, stanza ) {
		var user = chat.getUser( stanza.fromUsername );
		if ( user.role === 'moderator' ) {
			var match = unbanRegex.exec( stanza.message );
			var userToUnban = match[2];

			var affiliationStanza = getUserAffiliationStanza( chat.credentials, userToUnban, 'none' );
			chat.client.send( affiliationStanza );

			chat.sendMessage( '@' + userToUnban + ' has been unbanned!' );
		}
    }
}, {
    types: ['message'],
    regex: banRegex,
    action: function( chat, stanza ) {
		var user = chat.getUser( stanza.fromUsername );
		if ( user.role === 'moderator' ) {
			var match = banRegex.exec( stanza.message );
			var userToBan = match[2];

			var affiliationStanza = getUserAffiliationStanza( chat.credentials, userToBan, 'outcast' );
			chat.client.send( affiliationStanza );
		}
    }
}];
