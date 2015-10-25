'use strict';

/**
 * Greets a viewer when they join the stream.
 * There is a different message displayed for new viewers vs. previous viewers.
 */

const runtime = require('../utils/Runtime');
const greetings = {
	"existing" : {
		"Viewer" : [
			`Back again! How's life treating you today?`,
			`Hey friend! What are you working on today?`,
		],
		"Royalty" : [
			'The king has arrived! We appreciate your support!'
		]
	},
	"new" : [
		'Welcome to the stream! Thanks for stopping by!'
	]
}

/**
 * Returns a random greeting from the
 * available greetings passed-in.
 * @param  {array} availableGreetings
 * @return {string}
 */
var getRandomGreeting = function( availableGreetings ) {
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
			greeting = getRandomGreeting( greetings[ 'existing' ][ stanza.user.status ] );
		} else {
			// new viewer
			greeting = getRandomGreeting( greetings[ 'new' ] );
		}

		chat.replyTo( stanza.user.username, greeting );
    }
}];
