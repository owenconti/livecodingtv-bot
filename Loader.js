'use strict';

const fs = require('fs');
const path = require('path');
const Log = require('./utils/Log');
const commandTypes = ['message', 'presence', 'startup', 'websocket'];

class Loader {
	static loadCoreCommands( callback ) {
		let coreCommands = {};

		// Make sure each command type is an array
		commandTypes.forEach( (commandType) => {
			coreCommands[ commandType ] = [];
		} );

		// Load all files in the commands directory into an array
		fs.readdir( './commands' , function( err, files ) {
			if ( err ) {
				Log.log( 'ERROR: ' + err );
				return;
			}

			files.forEach( function(fileName) {
				if ( fileName.indexOf( '.js' ) >= 0 ) {
					let commands = require( './commands/' + fileName );

					// Loop through each command so we can separate out
					// each command type to its own array.
					commands.forEach( (command) => {
						Loader.parseCommandIntoMessageTypes( command, coreCommands );
					} );
				}
			} );

			callback( coreCommands );
		});
	}

	static loadPluginCommands( callback ) {
		let pluginCommands = {};

		// Make sure each command type is an array
		commandTypes.forEach( (commandType) => {
			pluginCommands[ commandType ] = [];
		} );

		// Load all files in the commands directory into an array
		let pluginsDir = path.join( __dirname, 'plugins' );
		fs.readdir( pluginsDir , function( err, folders ) {
			if ( err ) {
				Log.log( 'ERROR: ' + err );
				return;
			}

			folders.forEach( ( folder ) => {
				let pluginIndexFile = path.join( pluginsDir, folder, 'index.js' );
				let commands = require( pluginIndexFile );

				// Loop through each command so we can separate out
				// each command type to its own array.
				commands.forEach( (command) => {
					Loader.parseCommandIntoMessageTypes( command, pluginCommands );
				} );
			} );

			callback( pluginCommands );
		});
	}

	static parseCommandIntoMessageTypes( command, commandObject ) {
		// Loop through each command so we can separate out
		// each command type to its own array.
		commandTypes.forEach( ( commandType ) => {
			if ( command.types.indexOf( commandType ) >= 0 ) {
				commandObject[ commandType ].push( command );
			}
		} );
	}
}

module.exports = Loader;
