'use strict';

const xmpp = require('node-xmpp');
const crypto = require('crypto');
const Log = require('./utils/Log');
const runtime = require('./utils/Runtime');
const User = require('./model/User');

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
			console.log('CLIENT ERROR: ', err);
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
		const users = runtime.brain.get( 'users' );
		let userObj = users[ username ] || {};

		return new User( userObj );
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
		let jid = stanza.attrs.from;
        let username = jid.substr( jid.indexOf( '/' ) + 1 );
        var body = Client.findChild( 'body', stanza.children );
        var message = body.children.join('').replace('\\', '');

		// Limit users to only run commands once every 5 seconds
		const now = new Date().getTime();
		let messages = runtime.brain.get( 'userMessages' ) || {};
		let userMessageLog = messages[ username ];
		if ( !userMessageLog ) {
			userMessageLog = {
				messageTimes: [],
				lastCommandTime: 0
			};
		}

		// If the user's most recent command was within 5 seconds,
		// return false and all commands will be skipped.
		if ( username !== credentials.username ) {
			// Only rate limit users who are not the bot :)
			if ( userMessageLog.lastCommandTime > 0 && now - userMessageLog.lastCommandTime < 5000 ) { // 5 seconds
				rateLimited = true;
			}
		}

		// Push 'now' time into the user's message times
		userMessageLog.messageTimes.push( now );

		// Update the message log for the user
		messages[ username ] = userMessageLog;
		runtime.brain.set( 'userMessages', messages );

		let users = runtime.brain.get( 'users' ) || {};
		let userObj = users[ username ] || {
			username: username
		};
		let user = new User( userObj );

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
		let users = runtime.brain.get( 'users' ) || {};
		let userObj = users[ username ];

		if ( !userObj ) {
			// New viewer
			userObj = {
				username: username,
				count: 1,
				time: new Date().getTime(),
				role: role
			};
		} else {
			// Update the user's view count and presence time
			// only if their count hasn't been updated in
			// the last 10 minutes.
			const now = new Date().getTime();
			const minutes = 10;
			if ( now - userObj.time > 1000 * 60 * minutes ) {
				userObj.count++;
				userObj.time = now;
			}
		}
		if ( !userObj.status ) {
			userObj.status = 'Viewer';
		}

		let user = new User( userObj );

		// If presence is unavailable,
		// return without storing user object
		if ( message === 'unavailable' ) {
			return { type, user, message, role };
		}

		users[ user.username ] = userObj;
		runtime.brain.set( 'users', users );

        return { type, user, message, role };
    }

	/**
	 * [updateLatestCommandLog description]
	 * @param  {Stanza} stanza
	 * @return {void}
	 */
	static updateLatestCommandLog( stanza ) {
		let messages = runtime.brain.get( 'userMessages' ) || {};
		let userMessageLog = messages[ stanza.user.username ] || {};
		userMessageLog.lastCommandTime = new Date().getTime();

		runtime.brain.set( 'userMessages', messages );
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
