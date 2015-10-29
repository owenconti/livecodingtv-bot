'use strict';

const Settings = require('../utils/Settings');
const disconnectMessage = Settings.getSetting( __filename, 'disconnectMessage' );
const Templater = require('../utils/Templater');
const Say = require('../utils/Say');

module.exports = [{
    types: ['presence'],
    regex: /^unavailable$/,
    action: function( chat, stanza ) {
		let msg = Templater.run( disconnectMessage, {
			username: stanza.user.username
		} );
        Say.say( stanza.user.username + ' disconnected.' );
    }
}];
