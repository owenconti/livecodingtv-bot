'use strict';

module.exports = [{
    types: ['message'],
    regex: /^(!|\/)(help|commands)$/,
    action: function( chat, stanza ) {
		var output = `Built-in commands:

!help - Lists the availabe commands.
!addcommand - Adds a new command to the bot.
!removecommand - Removes a command from the bot.
!insult {@username} - Throws a random insult at said user.
!say {[-voice VoiceName]} {message} - Verbally speaks a message.
!todo - List the current TODOs.
!commits - list 3 latest commits.
!commits summary {weeks} - Draw graph of commits over last X weeks.
!top {X} - Displays the top X viewers.
!voices - Lists the available voices to be used with the !say command.`;

		// Get our custom commands
		var customCommands = chat.getSetting('customCommands') || {};
		var customCommandKeys = Object.keys( customCommands );

		if ( customCommandKeys.length > 0 ) {
			output += '\n\nCustom commands:\n';
			customCommandKeys.forEach( ( command ) => {
				output += '\n!' + command;
			} );
		}

        chat.sendMessage( output );
    }
}]
