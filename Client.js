'use strict';

var xmpp = require('node-xmpp');
var brain = require('node-persist');
var crypto = require('crypto');

// Local variables
var _users = [];

class Client {
    /**
     * Connect to a room
     * @param  {string} jid
     * @param  {string} password
     * @param  {string} room
     * @param  {string} username
     * @return {void}
     */
    constructor( credentials, debug ) {
		this.credentials = credentials;
		this.debug = debug;

        // Fire up the brain!
        brain.initSync({
            dir: __dirname + '/brain'
        });

        // Connect to the server
        this.client = new xmpp.Client({
            jid: this.credentials.jid,
            password: this.credentials.password
        });

        // Once online, send presence to the room
        this.client.on('online', function( resp ) {
            console.log( 'Connected to server' );

            this.sendPresence();
        }.bind( this ) );
    }

    /**
     * Sends a message to the specified room.
     * @param  {string} msg
     * @param  {string} room
     * @return {void}
     */
    sendMessage( msg ) {
		if ( this.debug ) {
			console.log('DEBUGGING: ' + msg);
			return false;
		}

		// Get the previously sent messages
		let messages = brain.getItem('messages') || {};

		// Hash the message and use it as our key.
		// Grab the previous message.
		// Build the new message object.
		let hash = crypto.createHash('md5').update( msg ).digest('hex');
		let previousMessage = messages[ hash ];
		let messageObj = {
			message: msg,
			time: new Date().getTime()
		};

		// Compare the previous message time vs the current message time
		// Only send the message to the server, if the difference is > 5 seconds
		if ( !previousMessage || messageObj.time - previousMessage.time > 5000 ) { // 5 seconds
			this.client.send(
	    		new xmpp.Element('message', {
	    			to: this.credentials.roomJid,
	    			type: 'groupchat'
	    		})
	        	.c('body')
	            .t( msg )
	      	);
		} else {
			console.log( 'Skipping sendMessage - previous message sent within 5 seconds' );
		}

		// Save the message to the messages store
		messages[ hash ] = messageObj;
		brain.setItem( 'messages', messages );
    }

    /**
     * Replies to the specified user.
     * @param  {string} username
     * @param  {string} msg
     * @return {void}
     */
    replyTo( username, msg ) {
        this.sendMessage( '@' + username + ': ' + msg );
    }

    /**
     * Listens for messages and calls the passed-in callback.
     * @param  {function} action
     * @return {void}
     */
    listen( action ) {
        this.client.on('stanza', function( stanza ) {
            action( stanza );
        });
    }

    /**
     * Returns the array of users who have joined chat.
     * @return {array}
     */
    getUsers() {
        return _users;
    }

    /**
     * Returns the user based on the specified username.
     * @param  {string} username
     * @return {object}
     */
    getUser( username ) {
        var user = null;
        for ( var _user of _users ) {
            if ( _user.username === username ) {
                user = _user;
                break;
            }
        }
        return user;
    }

    /**
     * Retrieves a setting from the brain.
     * @param  {string} key
     * @return {any}
     */
    getSetting( key ) {
        return brain.getItem( key ) || null;
    }

    /**
     * Store a setting in the brain.
     * @param  {string} key
     * @param  {any} value
     * @return {void}
     */
    saveSetting( key, value ) {
        brain.setItem( key, value );
    }

    /**
     * Parses a stanza from the server
     * @param  {[type]} stanza [description]
     * @return {[type]}        [description]
     */
    static parseStanza( stanza ) {
        var type = stanza.name;

        switch( type ) {
            case 'message':
                return Client.parseMessage( stanza );
            case 'presence':
                return Client.parsePresence( stanza );
        }
    }

    static parseMessage( stanza ) {
        var type = 'message';
		var rateLimited = false;
        var fromUsername = Client.parseFromUsername( stanza );
        var body = Client.findChild( 'body', stanza.children );
        var message = body.children.join('').replace('\\', '');

		// Limit users to only run commands once every 5 seconds
		let messages = brain.getItem( 'userMessages' ) || {};
		let previousUserMessage = messages[ fromUsername ];
		let messageObj = {
			time: new Date().getTime()
		};

		// If the user's previous message was within 5 seconds,
		// return false and all commands will be skipped.
		if ( previousUserMessage && messageObj.time - previousUserMessage.time < 5000 ) { // 5 seconds
			rateLimited = true;
		}

		// Update the message store and return
		messages[ fromUsername ] = messageObj;
		brain.setItem( 'userMessages', messages );

        return { type, fromUsername, message, rateLimited };
    }

    static parsePresence( stanza ) {
        var type = 'presence';
        var fromUsername = Client.parseFromUsername( stanza );
        var message = stanza.attrs.type || 'available';

        // Find role
        var xObj = Client.findChild( 'x', stanza.children );
        var itemObj = Client.findChild( 'item', xObj.children );
        var role = itemObj.attrs.role;

        // Add the user to our array of
        // users when they join chat.
        if ( message === 'available' ) {
            _users.push({
                username: fromUsername,
                role: role
            });
        }

        return { type, fromUsername, message };
    }

    /**
     * Parses the 'from' user's username
     * @param  {object} stanza
     * @return {string}
     */
    static parseFromUsername( stanza ) {
        var fromJid = stanza.attrs.from;
        return fromJid.substr( fromJid.indexOf( '/' ) + 1 );
    }

    /**
     * Child a child based on the 'name' property
     * @param  {[type]} name     [description]
     * @param  {[type]} children [description]
     * @return {[type]}          [description]
     */
    static findChild( name, children ) {
        var result = null;
        for ( var index in children ) {
            var child = children[ index ];
            if ( child.name === name ) {
                result = child;
                break;
            }
        }
        return result;
    }

    /**
     * Sends the bot's presence to the room specified.
     * @return {void}
     */
     sendPresence() {
        this.client.send(
            new xmpp.Element('presence', {
                to: this.credentials.roomJid + '/' + this.credentials.username
            })
        );
    }
}

module.exports = Client;
