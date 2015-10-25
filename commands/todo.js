'use strict';

const runtime = require('../utils/Runtime');
const addRegex = new RegExp( /^(!|\/)todo\s(\-a)\s(.+)$/ );
const listRegex = new RegExp( /^(!|\/)todo$/ );
const removeRegex = new RegExp( /^(!|\/)todo\s(\-r)\s(\d{1})$/ );
const completeRegex = new RegExp( /^(!|\/)todo\s(\-c)\s(\d{1})$/ );

/**
 * COMMANDS:
 *
 * List items:
 * 	!todo
 * Add item:
 * 	!todo -a Item name
 * Complete item:
 * 	!todo -c Item #
 * Remove item:
 * 	!todo -r Item #
 */

module.exports = [{
    types: ['message'],
    regex: listRegex,
    action: function( chat, stanza ) {
		// LIST ITEMS
        var todos = runtime.brain.get('todos') || [];
		var completedTodos = runtime.brain.get('completedTodos') || [];
        var msg = '';

        if ( todos.length === 0 ) {
            msg = 'No todos.\n\n'
        } else {
            msg = 'Todos:\n';
            todos.forEach( function( todo, i ) {
                msg += (i + 1) + '. ' + todo + '\n';
            } );
        }

		if ( completedTodos.length > 0 ) {
			msg += 'Completed Todos:\n';
            completedTodos.forEach( function( todo, i ) {
                msg += (i + 1) + '. ' + todo + '\n';
            } );
		}

        chat.sendMessage( msg );
    }
}, {
    types: ['message'],
    regex: addRegex,
    action: function( chat, stanza ) {
		// ADD ITEMS
        if ( stanza.user.isModerator() ) {
            var todos = runtime.brain.get('todos') || [];
            var item = addRegex.exec( stanza.message )[3];

            todos.push( item );
            runtime.brain.set('todos', todos);

			chat.sendMessage( 'Todo item added!' );
        }
    }
}, {
    types: ['message'],
    regex: removeRegex,
    action: function( chat, stanza ) {
		// REMOVE ITEMS
        if ( stanza.user.isModerator() ) {
	        var todos = runtime.brain.get('todos') || [];
	        var todoIndex = parseInt( removeRegex.exec( stanza.message )[3], 10 );
			var itemToRemove = todos[ todoIndex - 1 ];

			if ( !itemToRemove ) {
	            chat.sendMessage( 'Todo #' + todoIndex + ' not found!' );
				return;
	        }

	        todos.splice( todoIndex - 1, 1 );
		    runtime.brain.set('todos', todos);

	        chat.sendMessage( 'Removed Todo #' + todoIndex + '.' );
		}
    }
}, {
    types: ['message'],
    regex: completeRegex,
    action: function( chat, stanza ) {
		// COMPLETE ITEMS
        if ( stanza.user.isModerator() ) {
	        var todos = runtime.brain.get('todos') || [];
			var completedTodos = runtime.brain.get('completedTodos') || [];
	        var todoIndex = parseInt( completeRegex.exec( stanza.message )[3], 10 );
	        var itemToComplete = todos[ todoIndex - 1 ];

	        if ( !itemToComplete ) {
	            chat.sendMessage( 'Todo #' + todoIndex + ' not found!' );
				return;
	        }

			// Save the completed item to the completed todos array
			completedTodos.push( itemToComplete );
			runtime.brain.set('completedTodos', completedTodos);

			// Remove the completed item from the todos array
	        todos.splice( todoIndex - 1, 1 );
	        runtime.brain.set('todos', todos);

	        chat.sendMessage( 'Moved Todo #' + todoIndex + ' to the completed list.' );
		}
    }
}];
