'use strict';

var xmpp = require('node-xmpp');
var brain = require('node-persist');
var crypto = require('crypto');
var Log = require('./Log');

class Client {
    /**
     * Connect to a room
     * @param  {object} credentials
     * @param  {boolean} debug
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

		this.client.on('error', function(err) {
			console.log('CLIENT ERROR: ', err, err.stanza, err.stanza.Stanza);
		});

        // Once online, send presence to the room
        this.client.on('online', function( resp ) {
            Log.log( 'Connected to server' );

            this.sendPresence();
        }.bind( this ) );
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

    /**
     * Sends a message to the specified room.
     * @param  {string} msg
     * @param  {string} room
     * @return {void}
     */
    sendMessage( msg ) {
		if ( this.debug ) {
			Log.log('DEBUGGING: ' + msg);
			return false;
		}

		// Get the previously sent messages
		let messages = brain.getItem('messages') || {};

		// Hash the message and use it as our key.
		// Grab the previous message that uses the same hash.
		// (ie: the message text is the same).
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
			Log.log( 'Skipping sendMessage - previous message sent within 5 seconds' );
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
     * Returns the user based on the specified username.
     * @param  {string} username
     * @return {object}
     */
    getUser( username ) {
		const users = this.getSetting( 'users' );
		return users[ username ] || {};
    }

    /**
     * Retrieves a setting from the brain.
     * @param  {string} key
     * @return {any}
     */
    getSetting( key ) {
        return brain.getItemSync( key ) || null;
    }

    /**
     * Store a setting in the brain.
     * @param  {string} key
     * @param  {any} value
     * @return {void}
     */
    saveSetting( key, value ) {
        brain.setItemSync( key, value );
    }

    /**
     * Parses a stanza from the server
	 * @param  {Stanza} stanza
	 * @param  {obj} credentials
	 * @return {obj}
     */
    static parseStanza( stanza, credentials ) {
        var type = stanza.name;

        switch( type ) {
            case 'message':
                return Client.parseMessage( stanza, credentials );
            case 'presence':
                return Client.parsePresence( stanza, credentials );
        }
    }

	/**
	 * Parses the passed-in 'message' stanza.
	 * @param  {Stanza} stanza
	 * @param  {obj} credentials
	 * @return {obj}
	 */
    static parseMessage( stanza, credentials ) {
        var type = 'message';
		var rateLimited = false;
        var fromUsername = Client.parseFromUsername( stanza );
        var body = Client.findChild( 'body', stanza.children );
        var message = body.children.join('').replace('\\', '');

		// Limit users to only run commands once every 5 seconds
		const now = new Date().getTime();
		let messages = brain.getItem( 'userMessages' ) || {};
		let userMessageLog = messages[ fromUsername ];
		if ( !userMessageLog ) {
			userMessageLog = {
				messageTimes: [],
				lastCommandTime: 0
			};
		}

		// If the user's most recent command was within 5 seconds,
		// return false and all commands will be skipped.
		if ( fromUsername !== credentials.username ) {
			// Only rate limit users who are not the bot :)
			if ( userMessageLog.lastCommandTime > 0 && now - userMessageLog.lastCommandTime < 5000 ) { // 5 seconds
				rateLimited = true;
			}
		}

		// Push 'now' time into the user's message times
		userMessageLog.messageTimes.push( now );

		// Update the message log for the user
		messages[ fromUsername ] = userMessageLog;
		brain.setItem( 'userMessages', messages );

		// Return the parsed message
        return { type, fromUsername, message, rateLimited };
    }

	/**
	 * Parses the passed-in 'presence' stanza.
	 * @param  {Stanza} stanza
	 * @param  {obj} credentials
	 * @return {obj}
	 */
    static parsePresence( stanza, credentials) {
        var type = 'presence';
        var fromUsername = Client.parseFromUsername( stanza );
        var message = stanza.attrs.type || 'available';

        // Find role
        var xObj = Client.findChild( 'x', stanza.children );
        var itemObj = Client.findChild( 'item', xObj.children );
        var role = itemObj.attrs.role;

		// Store new users in the 'users' brain object
		let users = brain.getItem( 'users' ) || {};
		let userObj = users[ fromUsername ];
		if ( !userObj ) {
			// New viewer
			userObj = {
				username: fromUsername,
				count: 0,
				time: new Date().getTime(),
				role: role,
				status: 'Viewer'
			};
			users[ fromUsername ] = userObj;
			brain.setItem( 'users', users );
		}

        return { type, fromUsername, message, role };
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
	 * [updateLatestCommandLog description]
	 * @param  {Stanza} stanza
	 * @return {void}
	 */
	static updateLatestCommandLog( stanza ) {
		let messages = brain.getItem( 'userMessages' ) || {};
		let userMessageLog = messages[ stanza.fromUsername ] || {};
		userMessageLog.lastCommandTime = new Date().getTime();

		brain.setItem( 'userMessages', messages );
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
}

module.exports = Client;
