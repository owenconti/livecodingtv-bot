'use strict';

const runtime = require('../utils/Runtime');
const Settings = require('../utils/Settings');
const Client = require('../utils/Client');
const availableStatuses = Settings.getSetting( __filename, 'statuses' );
const setStatusRegex = new RegExp( /^(!|\/)setstatus\s(.+)\s(\w+)/ );
const getStatusRegex = new RegExp( /^(!|\/)getstatus\s(.+)/ );

module.exports = [{
	// !status - Returns the fromUser's status
	name: '!status',
	help: 'Returns the status of the user.',
    types: ['message'],
    regex: /^(!|\/)status/,
    action: function( chat, stanza ) {
		let statusObj = availableStatuses[ stanza.user.status.toLowerCase() ];
		chat.sendMessage(`${stanza.user.username} is set to: ${ statusObj.title }`);
    }
}, {
	name: '!getstatus {username}',
	help: 'Returns the status of the specified user.',
    types: ['message'],
    regex: getStatusRegex,
    action: function( chat, stanza ) {
		let match = getStatusRegex.exec( stanza.message );
		let username = match[2];
		if ( username.indexOf('@') === 0 ) {
			username = username.substr(1);
		}

		// Look up the user
		let users = runtime.brain.get( 'users' ) || {};
		let user = users[ username ];

		if ( !user ) {
			chat.sendMessage( `User '${username}' cannot be found.` );
			return;
		}

		let statusObj = availableStatuses[ user.status.toLowerCase() ];
		chat.sendMessage(`${username} is set to: ${ statusObj.title }`);
    }
}, {
	name: '!setstatus {username} {status}',
	help: 'Sets the status of the specified user to the specified status.',
	types: ['message'],
    regex: setStatusRegex,
    action: function( chat, stanza ) {
		if ( stanza.user.isModerator() ) {
			let match = setStatusRegex.exec( stanza.message );
			let statusToSet = match[3].toLowerCase();
			let username = match[2];
			if ( username.indexOf('@') === 0 ) {
				username = username.substr(1);
			}

			// Check if the status to set is an available status
			if ( !isAvailableStatus( statusToSet ) ) {
				chat.replyTo( username, `${ statusToSet } is not a valid status.` );
				return;
			}

			// Set the status
			let user = Client.getUser( username );
			user.status = statusToSet;
			user.saveToBrain();

			let statusObj = availableStatuses[ statusToSet.toLowerCase() ];
			chat.replyTo(username, `is now a ${statusObj.title}!` );
		}
    }
}];

/**
 * Returns a boolean if the passed-in status is
 * an available status.
 * @param  {String}  status
 * @return {Boolean}
 */
function isAvailableStatus( statusID ) {
	statusID = statusID.toLowerCase();
	let statuses = Object.keys( availableStatuses ).map( ( statusKey ) => {
		return statusKey.toLowerCase();
	} );
	return statuses.indexOf( statusID ) >= 0;
}
