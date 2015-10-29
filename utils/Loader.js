'use strict';

const fs = require('fs');
const path = require('path');
const Log = require('./Log');
const commandTypes = ['message', 'presence', 'startup', 'websocket'];

class Loader {
	static loadCoreCommands( callback ) {
		let coreCommands = {};

		// Make sure each command type is an array
		commandTypes.forEach( (commandType) => {
			coreCommands[ commandType ] = [];
		} );

		// Load all files in the commands directory into an array
		let commandsDir = path.join( __dirname, '..', 'commands' );
		fs.readdir( commandsDir, function( err, files ) {
			if ( err ) {
				Log.log( 'ERROR: ' + err );
				return;
			}

			files.forEach( function(fileName) {
				if ( fileName.indexOf( '.js' ) >= 0 ) {
					let filePath = path.join( commandsDir, fileName );
					let commands = require( filePath );

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
		let pluginsDir = path.join( __dirname, '..', 'plugins' );
		fs.readdir( pluginsDir , function( err, folders ) {
			if ( err ) {
				Log.log( 'WARNING: No /plugins directory exists.' );
				callback( pluginCommands );
				return;
			}

			folders.forEach( ( folder ) => {
				let pluginIndexFile = path.join( pluginsDir, folder, 'index.js' );
				fs.stat( pluginIndexFile, function(err, stat) {
					if ( err ) {
						console.warn(`[bot] Plugin: ${folder} missing index.js. Skipping plugin.`);
						return;
					}

					// Loop through each command so we can separate out
					// each command type to its own array.
					let commands = require( pluginIndexFile );
					commands.forEach( (command) => {
						Loader.parseCommandIntoMessageTypes( command, pluginCommands );
					} );
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
