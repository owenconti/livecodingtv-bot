'use strict';

/**
 * Greets a viewer when they join the stream.
 * There is a different message displayed for new viewers vs. previous viewers.
 */

const runtime = require('../utils/Runtime');
const Settings = require('../utils/Settings');
const greetings = Settings.getSetting( __filename, 'greetings' );

/**
 * Returns a random greeting from the
 * available greetings passed-in.
 * @param  {array} availableGreetings
 * @return {string}
 */
var getRandomGreeting = function( availableGreetings ) {
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
		let greeting;
		let existingViewer = stanza.user.viewCount > 1;

		// Find the greeting to send to the user
		if ( existingViewer ) {
			// existing viewer
			// check if the user's status exists in the greetings
			let greetingsArray = greetings[ 'existing' ][ stanza.user.status ];
			if ( !greetingsArray ) {
				let firstExistingStatus = Object.keys( greetings[ 'existing' ] )[0];
				greetingsArray = greetings[ 'existing' ][ firstExistingStatus ];
			}
			greeting = getRandomGreeting( greetings[ 'existing' ][ stanza.user.status ] );
		} else {
			// new viewer
			greeting = getRandomGreeting( greetings[ 'new' ] );
		}

		chat.replyTo( stanza.user.username, greeting );
    }
}];
