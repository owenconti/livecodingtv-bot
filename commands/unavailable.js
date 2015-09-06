module.exports = {
    types: ['presence'],
    regex: /^unavailable$/,
    action: function( chat, stanza ) {
        chat.sendMessage( '@' + stanza.fromUsername + ' has disconnected.' );
    }
}
