'use strict';

const runtime = require('../utils/Runtime');

module.exports = [{
    types: ['message'],
    regex: /^(!|\/)(help|commands)$/,
    action: function( chat, stanza ) {
		var output = `Built-in commands:

!addcommand - Adds a new command to the bot (Mod only).
!ban {@username} - Bans the user (Mod only).
!commits - list 3 latest commits.
!commits summary {weeks} - Draw graph of commits over last X weeks.
!getstatus {@username} - Returns the Status of the user.
!help - Lists the availabe commands.
!insult {@username} - Throws a random insult at said user.
!removecommand - Removes a command from the bot (Mod only).
!say {[-voice VoiceName]} {message} - Verbally speaks a message.
!setstatus {@username} {status} - Sets the status of the user (Mod only).
!status - Returns the status for the user.
!todo - List the current TODOs.
!top {X} - Displays the top X viewers.
!unban {@username} - Unbans the user (Mod only).
!voices - Lists the available voices to be used with the !say command.`;

		// Get our custom commands
		var customCommands = runtime.brain.get('customCommands') || {};
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
