'use strict';

const setStatusRegex = new RegExp( /^(!|\/)setstatus\s(.+)\s(\w+)/ );
const getStatusRegex = new RegExp( /^(!|\/)getstatus\s(.+)/ );

module.exports = [{
    types: ['message'],
    regex: getStatusRegex,
    action: function( chat, stanza ) {
		var match = getStatusRegex.exec( stanza.message );
		var username = match[2];
		if ( username.indexOf('@') === 0 ) {
			username = username.substr(1);
		}

		// Look up the user
		var users = chat.getSetting( 'users' ) || {};
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
    types: ['message'],
    regex: setStatusRegex,
    action: function( chat, stanza ) {
		var match = setStatusRegex.exec( stanza.message );
		var statusToSet = match[3];
		var username = match[2];
		if ( username.indexOf('@') === 0 ) {
			username = username.substr(1);
		}

		// Look up the user
		var users = chat.getSetting( 'users' ) || {};
		var user = users[ username ];

		if ( !user ) {
			chat.sendMessage( `User '${username}' cannot be found.` );
			return;
		}

		// Set the status
		user.status = statusToSet;
		chat.saveSetting('users', users);

		chat.replyTo(username, `is now a ${statusToSet}!` );
    }
}];
