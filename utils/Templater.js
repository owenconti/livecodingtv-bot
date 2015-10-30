'use strict';

class Templater {
	/**
	 * Runs a template string through a key/value map.
	 * @param  {String} templateString
	 * @param  {Object} model
	 * @return {String}
	 */
	static run( templateString, model ) {
		let keys = Object.keys( model );
		keys.forEach( ( key ) => {
			let pattern = new RegExp( "{{" + key + "}}", "g" );
			templateString = templateString.replace( pattern, model[key] );
		} );

		return templateString;
	}
}

module.exports = Templater;
