'use strict';

const brain = require('node-persist');

class Brain {
	static start( directory ) {
		brain.initSync({
			dir: directory
		});
	}

	static get( key ) {
		return brain.getItem( key ) || null;
	}

	static set( key, value ) {
		return brain.setItem( key, value );
	}
};

module.exports = Brain;
