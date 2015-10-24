'use strict';

var http = require('http');
let WebSocketServer = require('websocket').server;
let server = null;
let wsServer = null;
let connections = {};

function startServer( callback ) {
	server = http.createServer(function(request, response) {
	    console.log((new Date()) + ' Received request for ' + request.url);
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

		connection.on('message', function(message) {
			var messageObj = JSON.parse( message.utf8Data );
			// Store the connection in the connections object
			if ( messageObj.message === 'subscribe' ) {
				connections[ messageObj.data ] = connection;
			}
		});
	    connection.on('close', function() {
	        console.log(connection.remoteAddress + " disconnected");
	    });

	});
}

module.exports = {
	start: function() {
		startServer( () => {
			startWebsocket();
		});
	},
	sendMessage: function( username, messageObj ) {
		// Find the right connection
		let connection = connections[ username ];
		connection.sendUTF( JSON.stringify(messageObj) );
	}
};
