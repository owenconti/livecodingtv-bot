// API Trigger example
{
	apiTriggers: [{
		regex: /!xmetrix/,
		url: 'http://google.ca',
		method: 'GET',
		params: function( chat, stanza ) {
			return '?user=' + stanza.user.username + '&room=' + chat.credentials.room;
		}

		// url + params
	}]
}
