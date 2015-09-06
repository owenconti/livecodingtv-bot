'use strict';

var xmpp = require('node-xmpp');

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
        this.users = [];

        this.client = new xmpp.Client({
            jid: jid,
            password: password
        });

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

    listen( action ) {
        this.client.on('stanza', function( stanza ) {
            action( stanza );
        });
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
            break;
            case 'presence':
                return Client.parsePresence( stanza );
            break;
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

        // find role
        var xObj = Client.findChild( 'x', stanza.children );
        var itemObj = Client.findChild( 'item', xObj.children );

        this.users.push({
            fromUsername,
            role
        });

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
