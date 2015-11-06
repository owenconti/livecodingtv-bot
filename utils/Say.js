'use strict';

const isWin = /^win/.test( process.platform );
const say = isWin ? require('winsay') : require('say');
const Log = require('./Log');
const Settings = require('./Settings');
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
        // Check settings to make sure Say is enabled
        let sayEnabled = Settings.getSetting( 'SayUtil', 'enabled' );
        if ( !sayEnabled ) {
            return;
        }

		if ( !voice ) {
			voice = 'Victoria';
		}
		if ( !message || typeof message !== 'string' ) {
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
