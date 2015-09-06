module.exports = {
    types: ['message'],
    regex: /^(!|\/)help$/,
    action: function( chat, stanza ) {
        chat.sendMessage(`
            Available commands:\n
            !help - Lists the availabe commands.\n
            !project - Tells you what I am currently working on.\n
            !insult {@username} - Throws a random insult at said user.
        `);
    }
}
