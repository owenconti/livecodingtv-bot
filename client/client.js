jQuery(document).ready(function($) {
	// Declare variables
	var username = location.hash.substring( 1 );
	var socket;
	var isPlaying = false;
	var handlers = {};
	var dependencies = {
		jquery: true
	};

	// Load default dependencies

	function connectToWebsocketServer() {
		console.log('Connecting to WS server');

		socket = new WebSocket("ws://localhost:8881", 'lctv-bot');

		/**
		 * Opens the websocket connection.
		 * Connects to the bot server and
		 * sends a 'subscribe' message, and
		 * a 'isPlaying' message for the YouTube player.
		 * @return {void}
		 */
		socket.onopen = function() {
			console.log('Connected to WebSocket server. Sending subscription for ' + username);

			// subscribe to username's messages
			socket.send( JSON.stringify({
				message: 'subscribe',
				data: username,
			}) );
			socket.send( JSON.stringify({
				message: 'isPlaying',
				data: isPlaying
			}) );
		};

		/**
		 * Handles incoming websocket messages.
		 * Runs the 'message' value through the registered
		 * websocket handlers. If there is a match,
		 * it calls the handler's function.
		 * @param  {string} message
		 * @return {void}
		 */
		socket.onmessage = function(message) {
			var messageObj = JSON.parse( message.data );

			// Call registered handlers, if exists
			var messageHandlers = handlers[messageObj.message];
			if ( messageHandlers ) {
				messageHandlers.forEach( function(handler) {
					handler( messageObj );
				});
			}

			switch( messageObj.message ) {
				case 'clientFiles':
					var clientFiles = messageObj.files;
					clientFiles.forEach( function(clientFile) {
						var obj = eval( clientFile );

                        // Declare pluginSettings so they are passed-in
                        // to eval(obj.func)
                        var pluginSettings = obj.pluginSettings;

						// Load dependencies
						obj.dependencies.forEach( function( dependency ) {
							loadDependency( dependency.name, dependency.url );
						} );

						// Append the plugin's HTML to the DOM
                        if ( $('#' + obj.name).length === 0 ) {
                            var $html = $("<div />", {
    							id: obj.name,
    							class: 'plugin-module'
    						}).html( obj.html );
    						$('body').append( $html );

                            // Run the plugin's function,
    						// after a 3 second delay
    						setTimeout(function() {
    							eval( obj.func );
    						}, 3000);
                        }

					});
					break;
			}
		};

		/**
		 * Handles closing of the websocket connection.
		 * Will try to reconnect every 5 seconds.
		 * @param  {object} message
		 * @return {void}
		 */
		socket.onclose = function(message) {
			console.log('closed connection!');

			// try to reconnect
			setTimeout( connectToWebsocketServer, 5000 );
		};

		/**
		 * Handles a websocket error
		 * @param  {obj} err
		 * @return {void}
		 */
		socket.onerror = function(err) {
			console.log('Websocket error', err);
		};
	}
	connectToWebsocketServer();

	/**
	 * Registers the passed-in function as a message handler.
	 * @param  {String} messageName
	 * @param  {Function} func
	 * @return {void}
	 */
	function registerSocketMessage( messageName, func ) {
		var messageHandlers = handlers[ messageName ] || [];
		messageHandlers.push( func );
		handlers[ messageName ] = messageHandlers;
	}

	function loadDependency( name, url ) {
		if ( !dependencies[name] ) {
			var tag = $('<script />', {
				src: url
			});
			$('body').append( tag );

			dependencies[name] = true;
		}
	}
});
