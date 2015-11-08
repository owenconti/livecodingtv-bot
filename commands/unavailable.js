'use strict';

const Settings = require('../utils/Settings');
const fileSettings = Settings.getSettingFile( __filename );
const Templater = require('../utils/Templater');
const Say = require('../utils/Say');

module.exports = [{
    types: ['presence'],
    regex: /^unavailable$/,
    action: function( chat, stanza ) {
        if ( fileSettings.enabled ) {
    		let msg = Templater.run( fileSettings.disconnectMessage, {
    			username: stanza.user.username
    		} );
            Say.say( stanza.user.username + ' disconnected.' );
        }
    }
}];
