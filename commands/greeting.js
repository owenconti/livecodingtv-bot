module.exports = [{
    types: ['message'],
    regex: /^(hi|hello|hola|hey|greetings|sup)/,
    action: function( chat, stanza ) {
        chat.replyTo( stanza.fromUsername, 'Welcome!' );
    }
}];
