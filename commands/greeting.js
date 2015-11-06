'use strict';

/**
 * Greets a viewer when they join the stream.
 * There is a different message displayed for new viewers vs. previous viewers.
 */

const runtime = require('../utils/Runtime');
const Settings = require('../utils/Settings');
const Assets = require('../utils/Assets');
const Say = require('../utils/Say');
const websocket = require('../utils/websocket');

/**
 * Checks the settings files for greetings, for the passed-in viewerType
 * @param  {String} viewerType
 * @param  {String} status
 * @return {array}
 */
function findAvailableGreetings( viewerType, status ) {
	let greetingsForViewerType = Settings.getSetting( __filename, viewerType );

	// If the user is new, return the 'new' greetings
	if ( viewerType === 'new' ) {
		return greetingsForViewerType;
	} else {
		// User is existing
		if ( greetingsForViewerType && greetingsForViewerType[status] !== undefined ) {
			// Greeting for the user's status exists
			return greetingsForViewerType[status];
		} else {
			// Greeting for the user's status does not exist,
			// return greetings for the first status
			let firstExistingStatus = Object.keys( greetingsForViewerType )[0];
			return greetingsForViewerType[ firstExistingStatus ];
		}
	}
}

/**
 * Returns a random greeting from the
 * available greetings passed-in.
 * @param  {array} availableGreetings
 * @return {string}
 */
function getRandomGreeting( availableGreetings ) {
	if ( !availableGreetings ) {
		return Settings.getSetting( __filename, 'defaultGreeting' );
	}

	var length = availableGreetings.length;
	var index = Math.floor(Math.random() * length);
	return availableGreetings[ index ];
};

module.exports = [{
	types: ['presence'],
	regex: /^available$/,
	action: function( chat, stanza ) {
		let viewerType = stanza.user.viewCount > 1 ? 'existing' : 'new';
		let availableGreetings = findAvailableGreetings( viewerType, stanza.user.status );
		let greeting = getRandomGreeting( availableGreetings );

		chat.replyTo( stanza.user.username, greeting );

    setTimeout(() => {
      Say.say( stanza.user.username + ' connected bra.' )
    }, 1000);

    Assets.load('giphy.gif', function(base64Image) {
			websocket.sendMessage( chat.credentials.room, {
				message: 'showImage',
				image: base64Image
			});
		});
  }
}];
