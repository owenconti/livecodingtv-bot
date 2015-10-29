'use strict';

const runtime = require('../utils/Runtime');
const Settings = require('../utils/Settings');
const availableStatuses = Settings.getSetting( 'user-status', 'statuses' );

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

	/**
	 * Returns a boolean if the user has equal-to or
	 * greater than the passed-in permission.
	 * @param  {String}  statusID
	 * @return {Boolean
	 */
	hasStatus( statusID ) {
		let statusObj = availableStatuses[ statusID.toLowerCase() ];
		let userStatusObj = availableStatuses[ this.status.toLowerCase() ];
		return userStatusObj.weight >= statusObj.weight;
	}

	isModerator() {
		return this.hasStatus( 'moderator' );
	}

	isStreamer() {
		return this.username === runtime.credentials.room;
	}

	isBot() {
		return this.username === runtime.credentials.username;
	}
}

module.exports = User;
