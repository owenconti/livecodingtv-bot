'use strict';

const Say = require('../utils/Say');

module.exports = [{
    types: ['presence'],
    regex: /^unavailable$/,
    action: function( chat, stanza ) {
        Say.say( stanza.user.username + ' disconnected.' );
    }
}];
