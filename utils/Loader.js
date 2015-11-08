'use strict';

const fs = require('fs');
const path = require('path');
const Log = require('./Log');
const Settings = require('./Settings');
const commandTypes = ['message', 'presence', 'startup', 'websocket'];

class Loader {
	/**
	 * Load the enabled commands.
	 * @param  {Function} callback
	 * @return {void}
	 */
	static loadCoreCommands( callback ) {
		// Make sure each command type is an array
		let coreCommands = {};
		commandTypes.forEach( (commandType) => {
			coreCommands[ commandType ] = [];
		} );

		// Load all files in the commands directory into an array
		const commandsDir = path.join( __dirname, '..', 'commands' );
		fs.readdir( commandsDir, function( err, files ) {
			if ( err ) {
				Log.log( 'ERROR: ' + err );
				return;
			}

			files.forEach( function(fileName) {
				if ( fileName.indexOf( '.js' ) >= 0 ) {
					// Check settings to see if command is enabled
					// If command is enabled, load the command
					let commandName = fileName.replace('.js', '');
					let isCommandEnabled = Settings.getSetting('coreCommands', commandName);

					if ( isCommandEnabled === true ) {
						Log.log( `[Loader] Command loaded: ${commandName}` );

						// Loop through each command so we can separate out
						// each command type to its own array.
						let filePath = path.join( commandsDir, fileName );
						let commands = require( filePath );
						commands.forEach( (command) => {
							Loader.parseCommandIntoMessageTypes( command, coreCommands );
						} );
					}
				}
			});

			callback( coreCommands );
		});
	}

	/**
	 * Load the enabled plugins.
	 * @param  {Function} callback
	 * @return {void}
	 */
	static loadPluginCommands( callback ) {
		// Make sure each command type is an array
		let pluginClientFiles = [];
		let pluginCommands = {};
		commandTypes.forEach( (commandType) => {
			pluginCommands[ commandType ] = [];
		} );

		// Load all files in the commands directory into an array
		const pluginsDir = path.join( __dirname, '..', 'plugins' );
		fs.readdir( pluginsDir , function( err, folders ) {
			if ( err ) {
				Log.log( 'WARNING: No /plugins directory exists.' );
				callback( pluginCommands );
				return;
			}

			folders.forEach( ( pluginName ) => {
				let pluginIndexFile = path.join( pluginsDir, pluginName, 'index.js' );
				let pluginClientFile = path.join( pluginsDir, pluginName, 'client.js' );

				// Check settings to see if command is enabled
				// If command is enabled, load the command
				let isPluginEnabled = Settings.getSetting('plugins', pluginName);
				if ( isPluginEnabled === true ) {
					Log.log( `[Loader] Plugin loaded: ${pluginName}` );

					// Loop through each command so we can separate out
					// each command type to its own array.
					let commands = require( pluginIndexFile );
					commands.forEach( (command) => {
						Loader.parseCommandIntoMessageTypes( command, pluginCommands );
					} );

					// Load the client.js file, if it exists
					try {
						let clientJsFile = require( pluginClientFile );
						clientJsFile.func = 'var ' + clientJsFile.name + ' = ' + clientJsFile.func + '; ' + clientJsFile.name + '( socket, username, pluginSettings );';
						pluginClientFiles.push( clientJsFile );
					} catch( e ) {
						Log.log( `[Loader] No client.js file for plugin ${pluginName}` );
					}
				}
			});

			callback( pluginCommands, pluginClientFiles );
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
