module.exports = [{
    types: ['message'],
    regex: /^(!|\/)help$/,
    action: function( chat, stanza ) {
        chat.sendMessage(`
            Available commands:
            !help - Lists the availabe commands.
            !project - Tells you what I am currently working on.
            !insult {@username} - Throws a random insult at said user.
            !say {[-voice VoiceName]} {message} - Verbally speaks a message.
            !todo - List the current TODOs.
			!commits - list 3 latest commits
		    !commits summary {weeks} - Draw basic graph of commits over last X weeks
        `);
    }
}]
