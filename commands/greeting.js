'use strict';

/**
 * Greets a viewer when they join the stream.
 * There is a different message displayed for new viewers vs. previous viewers.
 */

const greetings = {
	"existing" : {
		"Viewer" : [
			`Back again! How's life treating you today?`
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
	var index = Math.floor(Math.random() * (length + 1));
	return availableGreetings[ index ];
};

module.exports = [{
	types: ['presence'],
	regex: /^available$/,
    action: function( chat, stanza ) {
		let users = chat.getSetting( 'users' ) || {};
		let userObj = users[ stanza.fromUsername ];
		let status = userObj.status;
		let existingViewer = userObj.count > 1;

		console.log( status );

		// Find the greeting to send to the user
		let greeting;

		if ( existingViewer ) {
			// existing viewer
			greeting = getRandomGreeting( greetings[ 'existing' ][ status ] );
		} else {
			// new viewer
			greeting = getRandomGreeting( greetings[ 'new' ] );
		}

		chat.replyTo( stanza.fromUsername, greeting );
    }
}];
