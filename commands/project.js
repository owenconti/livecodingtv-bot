var regex = new RegExp( /^(!|\/)setproject\s(.+)$/ );

module.exports = [{
    types: ['message'],
    regex: regex,
    action: function( chat, stanza ) {
        var user = chat.getUser( stanza.fromUsername );
        if ( user.role === 'moderator' ) {
            var projectValue = regex.exec( stanza.message )[2];
            chat.saveSetting( 'project',  projectValue );
        }
    }
}, {
    types: ['message'],
    regex: /^(!|\/)project$/,
    action: function( chat, stanza ) {
        console.log("chat.getSetting( 'project' )", chat.getSetting( 'project' ));

        chat.replyTo( stanza.fromUsername, chat.getSetting( 'project' ) );
    }
}]
