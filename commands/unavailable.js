var say = require('say');

module.exports = [{
    types: ['presence'],
    regex: /^unavailable$/,
    action: function( chat, stanza ) {
        say.speak('Victoria', stanza.fromUsername + ' disconnected.');
    }
}];
