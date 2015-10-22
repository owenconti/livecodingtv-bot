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

			chat.sendMessage( '@' + userToBan + ' has been banned!' );
		}
    }
}];
