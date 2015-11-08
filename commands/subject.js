'use strict';

const xmpp = require('node-xmpp-client');
const runtime = require('../utils/Runtime');
const setSubjectRegex = /^(!|\/)setsubject\s(.+)$/;

module.exports = [{
    name: '!setsubject {subject}',
    help: 'Sets the room\'s subject to {subject}.',
    types: ['message'],
    regex: setSubjectRegex,
    action: function( chat, stanza ) {
        if ( stanza.user.isModerator() ) {
            let subject = setSubjectRegex.exec( stanza.message )[2];

            // Build the stanza
            let subjectStanza = new xmpp.Stanza('message', {
        		from: runtime.credentials.jid,
        		id: 'lh2bs617',
        		to: runtime.credentials.roomJid,
        		type: 'groupchat'
        	})
        	.c('subject')
            .t( subject );

            chat.client.send( subjectStanza );
        }
    }
}]
