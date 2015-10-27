'use strict';

const runtime = require('../utils/Runtime');
const setStatusRegex = new RegExp( /^(!|\/)setstatus\s(.+)\s(\w+)/ );
const getStatusRegex = new RegExp( /^(!|\/)getstatus\s(.+)/ );

module.exports = [{
	// !status - Returns the fromUser's status
	name: '!status',
	help: 'Returns the status of the user.',
    types: ['message'],
    regex: /^(!|\/)status/,
    action: function( chat, stanza ) {
		var status = stanza.user.status;
		if ( !status ) {
			status = 'Viewer';
		}

		chat.sendMessage(`${stanza.user.username} is set to: ${status}`);
    }
}, {
	name: '!getstatus {username}',
	help: 'Returns the status of the specified user.',
    types: ['message'],
    regex: getStatusRegex,
    action: function( chat, stanza ) {
		var match = getStatusRegex.exec( stanza.message );
		var username = match[2];
		if ( username.indexOf('@') === 0 ) {
			username = username.substr(1);
		}

		// Look up the user
		var users = runtime.brain.get( 'users' ) || {};
		var user = users[ username ];

		if ( !user ) {
			chat.sendMessage( `User '${username}' cannot be found.` );
			return;
		}

		var status = user.status;
		if ( !status ) {
			status = 'Viewer';
		}

		chat.sendMessage(`${username} is set to: ${status}`);
    }
}, {
	name: '!setstatus {username} {status}',
	help: 'Sets the status of the specified user to the specified status.',
	types: ['message'],
    regex: setStatusRegex,
    action: function( chat, stanza ) {
		if ( stanza.user.isModerator() ) {
			var match = setStatusRegex.exec( stanza.message );
			var statusToSet = match[3];
			var username = match[2];
			if ( username.indexOf('@') === 0 ) {
				username = username.substr(1);
			}

			// Look up the user
			var users = runtime.brain.get( 'users' ) || {};
			var user = users[ username ];

			if ( !user ) {
				chat.sendMessage( `User '${username}' cannot be found.` );
				return;
			}

			// Set the status
			user.status = statusToSet;
			runtime.brain.set('users', users);

			chat.replyTo(username, `is now a ${statusToSet}!` );
		}
    }
}];
