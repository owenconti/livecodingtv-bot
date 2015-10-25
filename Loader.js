'use strict';

const fs = require('fs');
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

		callback( pluginCommands );

		// let pluginCommands = {};
		//
		// // Load all files in the commands directory into an array
		// fs.readdir( './plugins' , function( err, files ) {
		// 	if ( err ) {
		// 		Log.log( 'ERROR: ' + err );
		// 		return;
		// 	}
		//
		// 	files.forEach( function(fileName) {
		// 		if ( fileName.indexOf( '.js' ) >= 0 ) {
		// 			let commands = require( './commands/' + fileName );
		//
		// 			// Loop through each command so we can separate out
		// 			// each command type to its own array.
		// 			commands.forEach( (command) => {
		// 				Loader.parseCommandIntoMessageTypes( command, coreCommands );
		// 			} );
		// 		}
		// 	} );
		//
		// 	callback( coreCommands );
		// });
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
