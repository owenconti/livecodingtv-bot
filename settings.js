// API Trigger example
{
	apiTriggers: [{
		regex: /!xmetrix/,
		url: 'http://google.ca',
		method: 'GET',
		role: ['mod'],
		params: function( chat, stanza ) {
			return '?user=' + stanza.user.username + '&room=' + chat.credentials.room;
		}

		// url + params
	}]
}
