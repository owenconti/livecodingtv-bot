'use strict';

const insults = [
	'You stink!',
	'You\'re so ugly you look like a regex!'
];

/**
 * Commands:
 *
 * !insult {username} - Insults the specified user
 */

module.exports = [{
	name: '!insult {username}',
	help: 'Throws a random insult at the specified user.',
    types: ['message'],
    regex: /^(!|\/)insult\s\@(\w|\d)+$/,
    action: function( chat, stanza ) {
        var insultIndex = Math.round( Math.random() * (insults.length - 1) );
        var username = stanza.message.substr( stanza.message.indexOf( '@' ) + 1 );
        chat.sendMessage( 'Hey @' + username + '! ' + insults[ insultIndex ] );
    }
}]
