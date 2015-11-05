'use strict';

const http = require('http');
const WebSocketServer = require('websocket').server;
const runtime = require('./Runtime');
const Log = require('./Log');

class Websocket {
	start( client ) {
		this.httpServer = null;
		this.wsServer = null;
		this.chat = client;
		this.connections = {};

		this.startHttpServer( () => {
			this.startWebsocketServer();
		});
	}

	startHttpServer( callback ) {
		this.httpServer = http.createServer( (request, response) => {
		    response.writeHead(404);
		    response.end();
		});
		this.httpServer.listen(8881, () => {
		    console.log((new Date()) + ' Server is listening on port 8881');

			callback();
		});
	}

	startWebsocketServer() {
		this.wsServer = new WebSocketServer({
			httpServer: this.httpServer
		});

		this.wsServer.on('request', (request) => {
			let connection = request.accept('lctv-bot', request.origin);

			console.log(request.origin + ' connected');

			connection.on('message', (message) => {
				this.onConnectionMessage( connection, message );
			});

			// Handle websocket connection closed
		    connection.on('close', (e) => {
				this.onConnectionClose( connection );
		    });
		});
	}

	onConnectionMessage( connection, message ) {
		let messageObj = JSON.parse( message.utf8Data );
		let username = messageObj.data;

		// Store the connection in the connections object
		if ( messageObj.message === 'subscribe' ) {
			console.log(username, 'subscribed to websocket connection');

			this.connections[ username ] = connection;

			this.sendMessage( username, {
				message: 'clientFiles',
				files: runtime.pluginWebsocketFiles
			} );
		} else {
			// Run any core websocket commands
			runtime.coreCommands.websocket.forEach( ( command ) => {
				this.runWebsocketCommand( command, messageObj );
			} );

			// Run any plugin websocket plugins
			runtime.pluginCommands.websocket.forEach( ( command ) => {
				this.runWebsocketCommand( command, messageObj );
			} );
		}
	}

	/**
	 * Handles the closing of a connection
	 * @param  {obj} connection
	 * @return {void}
	 */
	onConnectionClose( connection ) {
		console.log( "Connection disconnected");
		connection = null;
	}

	/**
	 * Sends a message on the socket for the specified username
	 * @param  {string} username
	 * @param  {obj} messageObj
	 * @return void
	 */
	sendMessage( username, messageObj ) {
		// Find the right connection
		let connection = this.connections[ username ];

		if ( connection ) {
			connection.sendUTF( JSON.stringify(messageObj) );

			// Stop logging out giant base64 encoded images
			if ( messageObj.message === 'flyout' ) {
				messageObj = 'base64 encoded flyout image';
			}

			if ( messageObj.message === 'clientFiles' ) {
				messageObj = 'plugin client files';
			}

			console.log('WS message sent', username, messageObj);
		}
	}

	/**
	 * Runs the passed-in command if the messageObj
	 * passes the regex test.
	 * @param  {object} command
	 * @param  {object} messageObj
	 * @return {void}
	 */
	runWebsocketCommand( command, messageObj ) {
		try {
			var regexMatched = command.regex && command.regex.test( messageObj.message );
			if ( regexMatched ) {
				command.action( this.chat, messageObj );
			}
		} catch ( e ) {
			Log.log('[Websocket] Run command error', e);
		}
	}
}

module.exports = new Websocket();
