'use strict';

const assert = require('assert');
const simpleMock = require('simple-mock');
const Say = require('../../utils/Say');
const Assets = require('../../utils/Assets');

let sayCommands = require('../../commands/say');

describe('!say command', function() {
	let chat;

	beforeEach(function() {
		chat = {};
		simpleMock.mock( Assets, 'load' ).callFn(function() {});
		simpleMock.mock( Say, 'say' ).callFn(function() {});
	});
	afterEach(function() {
		chat = {};
		simpleMock.restore();
	});
	describe('!say {message}', function () {
		it('should call the Say.say command with default voice and a message', function () {
			sayCommands[0].action( chat, {
				type: 'message',
				username: 'ohseemedia',
				message: '!say testing',
				rateLimited: false
			} );
			assert.deepEqual( Say.say.lastCall.args, ['testing', 'Victoria'] );
		});
		it('should call the Say.say command with passed-in voice and a message', function () {
			sayCommands[0].action( chat, {
				type: 'message',
				username: 'ohseemedia',
				message: '!say -voice Frank testing',
				rateLimited: false
			} );
			assert.deepEqual( Say.say.lastCall.args, ['testing', 'Frank'] );
		});
		it('should strip the message to max 50 chars', function () {
			sayCommands[0].action( chat, {
				type: 'message',
				username: 'ohseemedia',
				message: '!say This message is longer than 50 characters. It should be stripped.',
				rateLimited: false
			} );
			assert.deepEqual( Say.say.lastCall.args, ['This message is longer than 50 characters. It shou', 'Victoria'] );
		});
	});
});
