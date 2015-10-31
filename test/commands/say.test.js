'use strict';

const assert = require('assert');
const simpleMock = require('simple-mock');
const Say = require('../../utils/Say');

let sayCommands = require('../../commands/say');

describe('Say', function() {
	let chat;

	beforeEach(function() {
		chat = {};

		simpleMock.mock( Say, 'say' );
		simpleMock.mock( chat, 'credentials' );
	});
	describe('!say {message}', function () {
		it('should call the Say.say command with default voice and a message', function () {
			sayCommands[0].action( chat, {
				type: 'message',
				username: 'ohseemedia',
				message: '!say testing',
				rateLimited: false
			} );

			assert( Say.say.called );
		});
	});
});
