'use strict';

const path = require('path');
let defaultSettings = require('../setup/defaultSettings.json');
let settings = require('../setup/settings.json');

class Settings {
	/**
	 * Returns a setting with the passed-in key,
	 * from the specified file.
	 * @param  {String} fileName
	 * @param  {String} key
	 * @return {any}
	 */
	static getSetting( fileName, key ) {
		fileName = path.basename( fileName, '.js' );

		// Check for the setting in settings.json first
		if ( settings[ fileName ] && settings[ fileName ][ key ] ) {
			return settings[ fileName ][ key ];
		}

		// If a setting was not found in the settings.json,
		// then search in the defaultSettings
		if ( defaultSettings[ fileName ] && defaultSettings[ fileName ][ key ] ) {
			return defaultSettings[ fileName ][ key ];
		}

		return null;
	}

	static getSettingFile( fileName ) {
		fileName = path.basename( fileName, '.js' );

		// Check for the setting in settings.json first
		if ( settings[ fileName ] ) {
			return settings[ fileName ];
		}

		// If a setting was not found in the settings.json,
		// then search in the defaultSettings
		if ( defaultSettings[ fileName ] ) {
			return defaultSettings[ fileName ];
		}

		return null;
	}
}

module.exports = Settings;
