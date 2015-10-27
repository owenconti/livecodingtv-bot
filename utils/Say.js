'use strict';

const isWin = /^win/.test( process.platform );
const say = isWin ? require('winsay') : require('say');
const Log = require('./Log');
const runtime = require('./Runtime');

let queue = [];
let speaking = false;

/**
 * Says the next item in the say queue.
 * @return void
 */
function sayNextItem() {
	if ( queue.length > 0 && !speaking ) {
		let item = queue[ 0 ];
		speaking = true;

		say.speak( item.voice, item.message, function() {
			queue.shift();
			speaking = false;
			sayNextItem();
		} );
	}
}

module.exports = {
	say( message, voice ) {
		if ( !voice ) {
			voice = 'Victoria';
		}
		if ( !message ) {
			throw new Error('Nothing to say!');
		}

		if ( runtime.debug ) {
			Log.log('DEBUGGING (say): ' + message);
			return;
		}

		let sayObj = {
			voice: voice,
			message: message
		};
		queue.push( sayObj );
		sayNextItem();
	}
};
