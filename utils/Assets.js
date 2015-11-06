'use strict';

const base64 = require('node-base64-image');
const path = require('path');
const fs = require('fs');

class Assets {
    static loadUrl( url, callback ) {
        // base64 encode the loaded image
		base64.base64encoder( url, {
			string: true
		}, function( err, image ) {
			if ( err ) {
				console.log(err);
				return;
			}

			if ( callback ) {
				callback( image );
			}
		} );
    }

	static load( fileName, callback ) {
		let filePath = path.join( __dirname, '../setup/custom/assets/', fileName );

		try {
			// Check for a custom asset
			fs.statSync( filePath );
		} catch( e ) {
			try {
				// No custom assets exists, look in the core assets directory
				filePath = path.join( __dirname, '../setup/core/assets/', fileName );
				fs.statSync( filePath );
			} catch( e2 ) {
				console.warn(`[bot] Asset: ${filePath} not found!`);
				return;
			}
		}

		// base64 encode the loaded image
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
		} );
	}
}

module.exports = Assets;
