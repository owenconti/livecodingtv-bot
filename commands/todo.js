'use strict';

const runtime = require('../utils/Runtime');
const addRegex = new RegExp( /^(!|\/)todo\s(\-a)\s(.+)$/ );
const listRegex = new RegExp( /^(!|\/)todo$/ );
const removeRegex = new RegExp( /^(!|\/)todo\s(\-r)\s(\d{1})$/ );
const completeRegex = new RegExp( /^(!|\/)todo\s(\-c)\s(\d{1})$/ );

module.exports = [{
	name: '!todo',
	help: 'List the current TODOs.',
    types: ['message'],
    regex: listRegex,
    action: function( chat, stanza ) {
		// LIST ITEMS
        let todos = runtime.brain.get('todos') || [];
		let completedTodos = runtime.brain.get('completedTodos') || [];
        let msg = '';

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
	name: '!todo -a {TODO item}',
	help: 'Adds specified item to the TODO list (Mod only).',
    types: ['message'],
    regex: addRegex,
    action: function( chat, stanza ) {
		// ADD ITEMS
        if ( stanza.user.isModerator() ) {
            let todos = runtime.brain.get('todos') || [];
            let item = addRegex.exec( stanza.message )[3];

            todos.push( item );
            runtime.brain.set('todos', todos);

			chat.sendMessage( 'Todo item added!' );
        }
    }
}, {
	name: '!todo -r {X}',
	help: 'Removes TODO item at index X from the TODO list (Mod only).',
    types: ['message'],
    regex: removeRegex,
    action: function( chat, stanza ) {
		// REMOVE ITEMS
        if ( stanza.user.isModerator() ) {
	        let todos = runtime.brain.get('todos') || [];
	        let todoIndex = parseInt( removeRegex.exec( stanza.message )[3], 10 );
			let itemToRemove = todos[ todoIndex - 1 ];

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
	name: '!todo -c {X}',
	help: 'Completes the TODO item at the specified index (Mod only).',
    types: ['message'],
    regex: completeRegex,
    action: function( chat, stanza ) {
		// COMPLETE ITEMS
        if ( stanza.user.isModerator() ) {
	        let todos = runtime.brain.get('todos') || [];
			let completedTodos = runtime.brain.get('completedTodos') || [];
	        let todoIndex = parseInt( completeRegex.exec( stanza.message )[3], 10 );
	        let itemToComplete = todos[ todoIndex - 1 ];

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
