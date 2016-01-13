'use strict';

const xmpp = require('node-xmpp-client');
const crypto = require('crypto');
const Log = require('./Log');
const runtime = require('./Runtime');
const User = require('../model/User');

class Client {
    /**
     * Connect to a room
     * @param  {object} credentials
     * @return {void}
     */
    constructor( credentials ) {
		this.credentials = credentials;

        // Connect to the server
        this.client = new xmpp.Client({
            jid: this.credentials.jid,
            password: this.credentials.password
        });

		this.client.on('error', function(err) {
			Log.log('CLIENT ERROR: ', err);
		});

        // Once online, send presence to the room
        this.client.on('online', function( resp ) {
            Log.log( 'Connected to server' );

            this.sendPresence();
            setInterval(this.sendPresence.bind(this), 1000 * 60);
        }.bind( this ) );
    }

	/**
     * Sends the bot's presence to the room specified.
     * @return {void}
     */
 	sendPresence() {
        Log.log('Sending presence to server');
        this.client.send(
            new xmpp.Stanza('presence', {
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
		if ( runtime.debug ) {
			Log.log('DEBUGGING: ' + msg);
			return false;
		}

		// Get the previously sent messages
		let messages = runtime.brain.get('messages') || {};

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
	    		new xmpp.Stanza('message', {
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
		runtime.brain.set( 'messages', messages );
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
     * Called from ChatBot.js
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
	 static getUser( username ) {
		const users = runtime.brain.get( 'users' ) || {};
		let userObj = users[ username ];

		if ( !userObj ) {
			// If the user joined the channel for the first time,
			// while the bot was not connected, the user will not
			// have an entry in the 'users' brain.
			// Create the entry for the user here
			userObj = {
				username: username,
				count: 1,
				time: new Date().getTime(),
				role: 'participant',
				status: 'Viewer'
			};
			users[ username ] = userObj;
			runtime.brain.set( 'users', users );
		}

		return new User( userObj );
    }

    /**
     * Parses a stanza from the server
	 * @param  {Stanza} stanza
	 * @param  {obj} credentials
	 * @return {obj}
     */
    static parseStanza( stanza, credentials ) {
        let type = stanza.name;

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
        let type = 'message';
		let rateLimited = false;
		let jid = stanza.attrs.from;
        let username = jid.substr( jid.indexOf( '/' ) + 1 );
        let body = Client.findChild( 'body', stanza.children );

        if ( !body ) {
            return false;
        }

        let message = body.children.join('').replace('\\', '');

		// Rate limiting
		const now = new Date().getTime();
		let messages = runtime.brain.get( 'userMessages' ) || {};
		let userMessageLog = messages[ username ];

		// Don't rate limit the bot
		if ( username !== credentials.username && userMessageLog ) {
			let lastCommandTimeExists = userMessageLog.lastCommandTime > 0;

			if ( lastCommandTimeExists && now - userMessageLog.lastCommandTime < 3000 ) { // 3 seconds
				rateLimited = true;
			}
		}

		let user = Client.getUser( username );

		// Return the parsed message
        return { type, user, message, rateLimited };
    }

	/**
	 * Parses the passed-in 'presence' stanza.
	 * @param  {Stanza} stanza
	 * @param  {obj} credentials
	 * @return {obj}
	 */
    static parsePresence( stanza, credentials) {
        let type = 'presence';
		let jid = stanza.attrs.from;
        let username = jid.substr( jid.indexOf( '/' ) + 1 );
        let message = stanza.attrs.type || 'available';

        // Find role
        let xObj = Client.findChild( 'x', stanza.children );
        let itemObj = Client.findChild( 'item', xObj.children );
        let role = itemObj.attrs.role;

		// Store new users in the 'users' brain object
		let user = Client.getUser( username );

		// Update the user's view count and presence time
		// only if their count hasn't been updated in
		// the last 5 minutes.
		const now = new Date().getTime();
		const minutes = 5;
		if ( now - user.lastVisitTime > 1000 * 60 * minutes ) {
			user.viewCount++;
			user.lastVisitTime = now;
		}

		// If presence is unavailable,
		// return without storing user object
		if ( message === 'unavailable' ) {
			return { type, user, message, role };
		}

		user.saveToBrain();

        return { type, user, message, role };
    }

	/**
	 * Records the user's message in the message log
	 * @param  {Stanza} stanza
	 * @return {void}
	 */
	static updateMessageLog( parsedStanza ) {
		const now = new Date().getTime();
		let messages = runtime.brain.get( 'userMessages' ) || {};
		let userMessageLog = messages[ parsedStanza.user.username ] || {
			messages: [],
			lastCommandTime: 0
		};

		userMessageLog.messages.push( {
			message: parsedStanza.message,
			time: now
		} );

		// If the user ran a command, track the time
		if ( parsedStanza.ranCommand ) {
			userMessageLog.lastCommandTime = now;
		}

		messages[ parsedStanza.user.username ] = userMessageLog;

		runtime.brain.set( 'userMessages', messages );
	}

    /**
     * Child a child based on the 'name' property
     * @param  {[type]} name     [description]
     * @param  {[type]} children [description]
     * @return {[type]}          [description]
     */
    static findChild( name, children ) {
        let result = null;
        for ( let index in children ) {
            let child = children[ index ];
            if ( child.name === name ) {
                result = child;
                break;
            }
        }
        return result;
    }
}

module.exports = Client;
