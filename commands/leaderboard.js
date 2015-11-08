'use strict';

/**
 * Leaderboard - tracks the number of times a viewer enters the stream.
 * Limits a viewer to update the leaderboard once every 10 minutes.
 *
 * Commands:
 *
 * !top X - Displays the top X viewers
 */

const runtime = require('../utils/Runtime');
const Log = require('../utils/Log');
const topRegex = /^(\!|\/)top\s(\d{1,2})$/;

module.exports = [{
	name: '!top {X}',
	help: 'Displays the top X viewers.',
	types: ['message'],
	regex: topRegex,
	action: function( chat, stanza ) {
		const x = parseInt( topRegex.exec( stanza.message )[2], 10 );

		// Grab users from the leaderboard brain object
		// Map the leaderboard into an array
		let users = runtime.brain.get( 'users' ) || {};
		let userScores = [];
		for ( let username in users ) {
			userScores.push( users[ username ] );
		}

		// Sort the entire leaderboard
		userScores.sort( function(a, b) {
			return a.count < b.count ? -1 : a.count > b.count ? 1 : 0;
		}).reverse();

		// Build the output message
		let msg = `Top ${x} Viewers:\n`;
		for ( let i = 0; i < x; i++ ) {
			const user = userScores[i];
			if ( user ) {
				let viewsText = user.count === 1 ? 'view' : 'views';
				msg += `${i+1}. ${user.username} with ${user.count} ${viewsText}!\n`;
			}
		}
		chat.sendMessage( msg );
	}
}]
