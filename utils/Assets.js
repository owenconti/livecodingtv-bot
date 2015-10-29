'use strict';

const base64 = require('node-base64-image');
const path = require('path');

class Assets {
	static load( fileName, callback ) {
		let filePath = path.join( __dirname, '../setup/coreAssets/', fileName );
		base64.base64encoder( filePath, {
			localFile: true,
			string: true
		}, function( err, image ) {
			if ( err ) {
				console.log(err);
				return;
			}

			if ( callback ) {
				callback( image );
			}
		} )
	}
}

module.exports = Assets;
