'use strict';

const runtime = require('../utils/Runtime');

class User {
	constructor( attrs ) {
		this.username = attrs.username;
		this.role = attrs.role;
		this.status = attrs.status;
		this.viewCount = attrs.count;
		this.lastVisitTime = attrs.time;
	}

	getMessages() {
		let messages = runtime.brain.get( 'userMessages' ) || {};
		let userMessageLog = messages[ this.username ];

		return userMessageLog;
	}

	isModerator() {
		return this.role === 'moderator';
	}

	isVIP() {
		return this.status === 'royalty';
	}

	isStreamer() {
		return this.username === runtime.credentials.room;
	}

	isBot() {
		return this.username === runtime.credentials.username;
	}
}

module.exports = User;
