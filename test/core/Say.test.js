'use strict';

const assert = require('assert');
const simpleMock = require('simple-mock');
const isWin = /^win/.test( process.platform );
const say = isWin ? require('winsay') : require('say');
const SayUtil = require('../../utils/Say');

let sayCommands = require('../../commands/say');

describe('Say Utility', function() {
	beforeEach(function() {
		simpleMock.mock( say, 'speak' ).callFn(function( voice, message, callback ) {
			callback();
		});
	});
	afterEach(function() {
		simpleMock.restore();
	});
	describe('Say.say', function () {
		it('calling say() with no message throws an error', function () {
			assert.throws( function() {
				SayUtil.say();
			} );
			assert.throws( function() {
				SayUtil.say( null );
			} );
			assert.throws( function() {
				SayUtil.say( undefined );
			} );
			assert.throws( function() {
				SayUtil.say( '' );
			} );
			assert.throws( function() {
				SayUtil.say( 10 );
			} );
		});
		it('calling say() with no voice defaults to Victoria', function () {
			SayUtil.say('Testing');
			assert.equal( say.speak.lastCall.args[0], 'Victoria' );
		});
		it('passes the correct message to say.speak', function () {
			SayUtil.say('Testing');
			assert.equal( say.speak.lastCall.args[1], 'Testing' );
		});
		it('passes the correct message to say.speak', function () {
			SayUtil.say('Testing', 'Frank');
			assert.equal( say.speak.lastCall.args[0], 'Frank' );
		});
	});
});
