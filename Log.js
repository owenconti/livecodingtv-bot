'use strict';

var brain = require('node-persist');

class Log {
	/**
	 * Logs parameters to console.log,
	 * stores all parameters in the brain.
	 * @return {void}
	 */
	static log() {
		let args = Array.prototype.slice.call(arguments);
		let logs = brain.getItem('logs') || [];

		args.forEach( function(arg) {
			console.log( arg );
			logs.push( arg );
		} );

		brain.setItem( 'logs', logs );
	}

}

module.exports = Log;
