'use strict';

var xmpp = require('node-xmpp');
var brain = require('node-persist');

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
    constructor( jid, password, username, roomJid ) {
        this.roomJid = roomJid;
        this.username = username;

        // Fire up the brain!
        brain.initSync({
            dir: __dirname + '/brain'
        });

        // Connect to the server
        this.client = new xmpp.Client({
            jid: jid,
            password: password
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
        this.client.send(
    		new xmpp.Element('message', {
    			to: this.roomJid,
    			type: 'groupchat'
    		})
        	.c('body')
            .t( msg )
      	);
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
        var fromUsername = Client.parseFromUsername( stanza );
        var body = Client.findChild( 'body', stanza.children );
        var message = body.children.join('').replace('\\', '');

        return { type, fromUsername, message };
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
                to: this.roomJid + '/' + this.username
            })
        );
    }
}

module.exports = Client;
