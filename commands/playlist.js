'use strict';

/*
	Song commands:

	!upcoming - List next 5 songs
	!song/!track/!music - current song
	!request URL - request a youtube link to be played
	!skip - skips the track
	!pause - pauses the track
	!play - plays the current track in the play list
 */
const runtime = require('../utils/Runtime');
const YouTube = require('youtube-node');
const Log = require('../utils/Log');
const websocket = require('../websocket');
const requestSongRegex = new RegExp( /^(!|\/)request\s(.+)$/ );

module.exports = [{
	// Reset current song index and playing boolean
    types: ['startup'],
    action: function( chat ) {
		let player = getPlayer( chat );
		player.playing = false;
		player.started = false;
		setPlayer( player, chat );
    }
}, {
	// Skips to the next song when the player is finished playing a song
    types: ['websocket'],
	regex: /^songEnded$/,
    action: function( chat, messageObj ) {
		skipSong( chat );
    }
}, {
	// Tell the chat what the current song is
    types: ['message'],
    regex: /^(!|\/)(song|track|music)$/,
    action: function( chat, stanza ) {
		let player = getPlayer( chat );
		let playlist = getPlaylist( chat );

		if ( player.playing && playlist.length > 0 ) {
			// Player is playing a song
			let currentSong = playlist[ player.currentSongIndex ];
			chat.sendMessage( `Current song: ${currentSong.title}`)
		} else {
			// Player is paused or playlist is empty
			chat.sendMessage( 'No song current playing.' );
		}
    }
}, {
	// Request a song
    types: ['message'],
    regex: requestSongRegex,
    action: function( chat, stanza ) {
		let match = requestSongRegex.exec( stanza.message );
		let youtubeID = match[2];

		// Look up the song information
		let youtube = getYoutubeClient( chat );
		youtube.getById( youtubeID, function(err, result) {
			if ( err ) {
				console.log( 'Error requesting youtube data:', err );
				return;
			}

			if ( result.items.length === 0 ) {
				chat.replyTo( stanza.user.username, 'Your song could not be found.' );
				return;
			}

			let videoObj = result.items[0].snippet;
			let playlist = getPlaylist( chat );
			let songObj = {
				youtubeID: youtubeID,
				requestedBy: stanza.user.username,
				time: new Date().getTime(),
				title: videoObj.title
			};
			playlist.push( songObj );
			setPlaylist( playlist, chat );

			Log.log( `Song: ${videoObj.title} has been added to the playlist by ${stanza.user.username}` );
			chat.replyTo( stanza.user.username, `${videoObj.title} has been added to the playlist!` );
		} )

    }
}, {
	// Remove current song
	// MOD only
    types: ['message'],
    regex: /^(!|\/)remove$/,
    action: function( chat, stanza ) {
		let player = getPlayer( chat );
		let playlist = getPlaylist( chat );

		if ( player.playing && stanza.user.isModerator() ) {
			playlist.splice( player.currentSongIndex, 1 );

			// If the song we're removing is not the first song,
			// decrease the index by 1, so 'skipSong' can properly
			// increase the index to the next song
			if ( player.currentSongIndex > 0 ) {
				player.currentSongIndex--;
				setPlayer( player, chat );
			}

			setPlaylist( playlist, chat );
			skipSong( chat );
		}

    }
}, {
	// Skip current song
	// MOD only - or vote to skip
    types: ['message'],
    regex: /^(!|\/)skip$/,
    action: function( chat, stanza ) {
		let player = getPlayer( chat );

		if ( stanza.user.isModerator() ) {
			skipSong( chat );
		}
    }
}, {
	// Pause current song
	// MOD only
    types: ['message'],
    regex: /^(!|\/)pause$/,
    action: function( chat, stanza ) {
		let player = getPlayer( chat );
		if ( stanza.user.isModerator() ) {
			player.playing = false;
			setPlayer( player, chat );

			websocket.sendMessage( chat.credentials.room, {
				message: 'pause'
			});
		}
    }
}, {
	// Play current song
	// MOD only
    types: ['message'],
    regex: /^(!|\/)play$/,
    action: function( chat, stanza ) {
		let player = getPlayer( chat );
		if ( stanza.user.isModerator() ) {
			if ( !player.started ) {
				let playlist = getPlaylist( chat );
				if ( playlist.length > 0 ) {
					player.started = true;

					let currentSong = playlist[ player.currentSongIndex ];
					websocket.sendMessage( chat.credentials.room, {
						message: 'skip',
						youtubeID: currentSong.youtubeID
					});
				}
			}

			player.playing = true;
			setPlayer( player, chat );

			websocket.sendMessage( chat.credentials.room, {
				message: 'play'
			});
		}
    }
}, {
    types: ['websocket'],
    regex: /^(!|\/)isPlaying$/,
    action: function( chat, messageObj ) {
		if ( messageObj.data ) {
			let player = getPlayer( chat );
			player.started = true;
			player.playing = true;
			setPlayer( player, chat );
		}
    }
}, {
	// List next songs in the playlist
    types: ['message'],
    regex: /^(!|\/)upcoming$/,
    action: function( chat, stanza ) {
		let player = getPlayer( chat );
		let playlist = getPlaylist( chat );
		let songs = [];
		let songsToDisplay = 5;
		if ( playlist.length < songsToDisplay ) {
			songsToDisplay = playlist.length;
		}

		let songIndex = player.currentSongIndex
		for ( let i = 0; i < songsToDisplay; i++ ) {
			if ( playlist.length === ( songIndex + 1 ) ) {
				songIndex = 0;
			} else {
				songIndex++;
			}
			songs.push( playlist[ songIndex ].title );
		}

		let msg = 'Next ' + songsToDisplay + ' songs:' + '\n';
		msg += songs.join('\n');

		chat.sendMessage( msg );
    }
}];

/**
 * Skips to the next song
 * @param  {Client} chat
 * @return void
 */
function skipSong( chat ) {
	let player = getPlayer( chat );
	let playlist = getPlaylist( chat );

	if ( playlist.length === ( player.currentSongIndex + 1 ) ) {
		// Current song is the last in the playlist, restart the playlist
		player.currentSongIndex = 0;
	} else {
		// Skip to next track in the playlist
		player.currentSongIndex++;
	}
	setPlayer( player, chat );

	if ( player.playing && playlist.length > 0 ) {
		// Player is playing a song
		let currentSong = playlist[ player.currentSongIndex ];
		websocket.sendMessage( chat.credentials.room, {
			message: 'skip',
			youtubeID: currentSong.youtubeID
		});
	}
}

/**
 * Returns the youtube-node client.
 * @param  {Client} chat
 * @return {YouTube}
 */
function getYoutubeClient( chat ) {
	let youtube = new YouTube();
	youtube.setKey( chat.credentials.youtubeApiKey );
	return youtube;
}

/**
 * Get the player status from the brain.
 * @param {Client} chat
 * @return {obj} player
 */
function getPlayer( chat ) {
	return runtime.brain.get( 'songPlayer' ) || {
		playing: false,
		currentSongIndex: 0
	};
}

/**
 * Save the player status to the brain.
 * @param {obj} player
 * @param {Client} chat
 */
function setPlayer( player, chat ) {
	runtime.brain.set( 'songPlayer', player );
}

/**
 * Returns the playlist from the brain.
 * @param  {Client} chat
 * @return {array}
 */
function getPlaylist( chat ) {
	return runtime.brain.get( 'playlist' ) || [];
}

/**
 * Saves the playlist to the brain.
 * @param  {array} playlist
 * @param  {Client} chat
 * @return void
 */
function setPlaylist( playlist, chat ) {
	runtime.brain.set( 'playlist', playlist );
}
