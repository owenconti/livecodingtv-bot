'use strict';

const moment = require('moment');
const brain = require('node-persist');
let logStorage = brain.create({
	dir: __dirname + '/../logs'
});
logStorage.initSync();

class Log {
	/**
	 * Logs parameters to console.log,
	 * stores all parameters in the brain.
	 * @return {void}
	 */
	static log() {
		let args = Array.prototype.slice.call(arguments);
		let date = moment().format('YYYY-MM-DD');
		let logs = logStorage.getItem('logs-' + date) || [];

		args.forEach( function(arg) {
			console.log( arg );
			logs.push( arg );
		} );

		logStorage.setItem( 'logs-' + date, logs );
	}

}

module.exports = Log;
