'use strict';

const http = require('http');
const WebSocketServer = require('websocket').server;
let runtime = require('./utils/Runtime');

let server = null;
let wsServer = null;
let connections = {};
let chat;

function startServer( callback ) {
	server = http.createServer(function(request, response) {
	    response.writeHead(404);
	    response.end();
	});
	server.listen(8881, function() {
	    console.log((new Date()) + ' Server is listening on port 8881');
		callback();
	});
};

function startWebsocket() {
	wsServer = new WebSocketServer({
		httpServer: server
	});
	wsServer.on('request', function(request) {
		var connection = request.accept('lctv-bot', request.origin);
		console.log(request.origin + ' connected');

		connection.on('message', function(message) {
			var messageObj = JSON.parse( message.utf8Data );
			// Store the connection in the connections object
			if ( messageObj.message === 'subscribe' ) {
				console.log(messageObj.data, 'subscribed to websocket connection');
				connections[ messageObj.data ] = connection;
			} else {
				// Loop through each websocket command,
				// run when the regex matches.
				runtime.websocketCommands.forEach( ( command ) => {
					try {
						var regexMatched = command.regex && command.regex.test( messageObj.message );
						command.action( chat, messageObj );
					} catch ( e ) {
						Log.log('ERROR', e);
					}
				} );
			}
		});
	    connection.on('close', function(e) {
	        console.log( "Connection disconnected");
			connection = null;
	    });

	});
}

module.exports = {
	/**
	 * Start the node server, and the websocket server.
	 * @param  {array} commands
	 * @return {void}
	 */
	start: function( client ) {
		chat = client;

		startServer( () => {
			startWebsocket();
		});
	},
	sendMessage: function( username, messageObj ) {
		console.log('WS message sent', username, messageObj);

		// Find the right connection
		let connection = connections[ username ];
		if ( connection ) {
			connection.sendUTF( JSON.stringify(messageObj) );
		}
	}
};
