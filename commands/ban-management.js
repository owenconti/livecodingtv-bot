'use strict';

const xmpp = require('node-xmpp-client');
const Assets = require('../utils/Assets');
const Websocket = require('../utils/Websocket');
const Say = require('../utils/Say');
const Log = require('../utils/Log');
const Settings = require('../utils/Settings');
const Templater = require('../utils/Templater');

const unbanRegex = new RegExp( /^(!|\/)unban\s(\w+)$/ );
const banRegex = new RegExp( /^(!|\/)ban\s(\w+)$/ );

class BanManagement {
    /**
     * Returns the commands this class exports.
     * @return {array}
     */
    static getCommands() {
        return [{
        	// Auto ban users flood messages to the chat
        	types: ['message'],
            regex: /./,
        	ignoreRateLimiting: true,
            action: function( chat, stanza ) {
        		const numberOfMessagesAllowed = 5;
        		const timeframeAllowed = 10; // seconds

        		// Never auto ban the streamer or the bot
        		if ( stanza.user.isStreamer() || stanza.user.isBot() ) {
        			return;
        		}

        		let userMessageLog = stanza.user.getMessages();
        		if ( userMessageLog ) {
        			let messages = userMessageLog.messages;
        			// If the user has sent at least the number of messages allowed
        			if ( messages.length > numberOfMessagesAllowed ) {
        				const now = new Date().getTime();

        				let startOfLimitMessage = messages[ messages.length - numberOfMessagesAllowed ];

        				// If the number of allowed messages sent by the user (ie: 5th)
        				// was sent within the last X seconds (timeframeAllowed),
        				// ban the user.
        				if ( now - startOfLimitMessage.time < ( timeframeAllowed * 1000 ) ) {
        					BanManagement.banUser( stanza.user.username, chat );
        				}
        			}
        		}

            }
        }, {
        	name: '!unban',
        	help: 'Unbans the specified user.',
        	types: ['message'],
            regex: unbanRegex,
            action: function( chat, stanza ) {
        		if ( stanza.user.isModerator() ) {
        			let match = unbanRegex.exec( stanza.message );
        			let userToUnban = match[2];

        			let affiliationStanza = BanManagement.getUserAffiliationStanza( chat.credentials, userToUnban, 'none' );
        			chat.client.send( affiliationStanza );

        			chat.sendMessage( '@' + userToUnban + ' has been unbanned!' );
        		}
            }
        }, {
        	name: '!ban',
        	help: 'Bans the specified user.',
            types: ['message'],
            regex: banRegex,
            action: function( chat, stanza ) {
        		if ( stanza.user.isModerator() ) {
        			let match = banRegex.exec( stanza.message );
        			let userToBan = match[2];

        			BanManagement.banUser( userToBan, chat );
        		}
            }
        }];
    }

    /**
     * Sends a ban stanza
     * @param  {string} username
     * @param  {object} chat
     * @return {void}
     */
    static banUser( username, chat ) {
        // Don't try to ban the streamer or the bot
        let user = chat.getUser( username );
        if ( user.isStreamer() || user.isBot() ) {
            Log.log('Attempt to ban streamer or bot.' );
            return false;
        }

        let affiliationStanza = BanManagement.getUserAffiliationStanza( chat.credentials, username, 'outcast' );
        chat.client.send( affiliationStanza );

        // Display the ban police flyout
        Assets.load( 'ban-police.png', function(base64Image) {
            let htmlContent = `<div>
                <span style="color: #000;
                font-size: 50px;
                position: absolute;
                left: 30px;
                top: 55px;
                font-family: Arial;
                text-transform: uppercase;
                display: block;
                text-align: center;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                width: 440px;
                padding: 0.5em 0;">${ username }</span>
                <img src="data:image/png;base64,${base64Image}"  />
            </div>`;

            Websocket.sendMessage( chat.credentials.room, {
                message: 'flyout',
                type: 'div',
                content: htmlContent,
                duration: 6000,
                animation: 'flyLeft'
            });

            let banSayMessage = Settings.getSetting('ban-management', 'banSayMessage');
            let message = Templater.run( banSayMessage, {
                username: username
            } );
            Say.say( message, 'Daniel' );
        });
    }

    /**
     * Returns a stanza to send to the server.
     * @param  {object} credentials
     * @param  {string} nickname
     * @param  {string} affiliation
     * @return {Stanza}
     */
    static getUserAffiliationStanza( credentials, nickname, affiliation ) {
    	let stanza = new xmpp.Stanza('iq', {
    		from: credentials.jid,
    		id: '12:sendIQ',
    		to: credentials.roomJid,
    		type: 'set',
    		xmlns: 'jabber:client'
    	})
    	.c('query', { xmlns: 'http://jabber.org/protocol/muc#admin' })
    	.c('item', { affiliation: affiliation, jid: nickname + '@livecoding.tv' });

    	return stanza;
    }
}

module.exports = BanManagement.getCommands();
