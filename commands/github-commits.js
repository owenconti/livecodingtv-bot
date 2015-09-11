var https = require('https');
var moment = require('moment');
var StringDecoder = require('string_decoder').StringDecoder;
var commitSummaryRegex = /^(!|\/)commits\ssummary\s(\d{1,2})$/;

/**
 * Commands:
 *
 * !commits - list 3 latest commits
 * !commits summary {weeks} - Draw basic graph of commits over last X weeks
 */

/**
 * Grab the commits for the repo from GitHub
 * @param  {Function} callback
 * @return {void}
 */
function getCommitsFromGithub( chat, parameters, callback ) {
	// Hit the github URL and get the commits data
	var opts = {
		hostname: 'api.github.com',
		port: 443,
		path: '/repos/' + chat.credentials.githubRepo + '/commits?' + parameters || '',
		method: 'GET',
		headers: {
			'User-Agent': 'ohseemedia-LCTV-Bot'
		}
	};
	var req = https.request( opts, function( res ) {
		var decoder = new StringDecoder('utf-8');
		var data = '';

		res.on('data', function( chunk ) {
			data += decoder.write(chunk);
		});
		res.on('end', function() {
			var json = JSON.parse( data );
			callback( json );
		});
	} );
	req.end();
}

module.exports = [{
	types: ['message'],
	regex: /^(!|\/)commits$/,
	action: function( chat, stanza ) {
		var commitMessages = [];

		getCommitsFromGithub( chat, '', function( json ) {
			for ( var i = 0; i < 3; i++ ) {
				var commit = json[ i ];
				var commitDate = moment( commit.commit.author.date, 'YYYY-MM-DDThh:mm:ssZ' ).format('YYYY-MM-DD');
				var msg = (i + 1) + '. ' + commitDate + ' - ' + commit.commit.message;
				commitMessages.push( msg );
			}

			if ( commitMessages.length === 0 ) {
				chat.sendMessage('No commits!');
				return;
			}

			chat.sendMessage( 'Last 3 commits:\n' + commitMessages.join('\n') );
		} );
	}
}, {
	types: ['message'],
	regex: commitSummaryRegex,
	action: function( chat, stanza ) {
		var numberOfWeeks = parseInt( commitSummaryRegex.exec( stanza.message )[2], 10 );
		var numberOfDays = numberOfWeeks * 7;
		var date = moment().subtract(numberOfWeeks, 'weeks');
		var since = date.format('YYYY-MM-DDTHH:MM:SSZ');
		var parameters = 'since=' + since;

		// Gather our days that we will display
		var weeks = [];
		var days = {};
		var today = moment();
		for ( var i = 0; i < numberOfWeeks; i++ ) {
			var week = {
				id: i + 1,
				startDate: '',
				endDate: '',
				days: []
			};
			for ( var d = 0; d < 7; d++ ) {
				if ( d === 0 ) {
					week.startDate = today.format('MM/DD');
				}
				if ( d === 6 ) {
					week.endDate = today.format('MM/DD');
				}

				var date = today.format('YYYY-MM-DD');
				week.days[ date ] = 0;
				days[date] = 0;

				today.subtract(1, 'day');
			}

			weeks.push(week);
		}

		getCommitsFromGithub( chat, parameters, function( commits ) {
			// Assign each commit to a date
			for ( var commit of commits ) {
				var commitDate = moment( commit.commit.author.date, 'YYYY-MM-DDThh:mm:ssZ' ).format('YYYY-MM-DD');
				days[commitDate]++;
			}

			// Loop the weeks
			// Output the start/end date for each each
			// Output the commit count for each day in the week
			var msg = '';
			for ( var week of weeks ) {
				msg += week.startDate + ' - ' + week.endDate + ': ';
				for ( var date in week.days ) {
					var commitCount = days[date];
					msg += commitCount === 0 ? ' _ ' : ' ' + commitCount + ' ';
				}
				msg += '\n';
			}

			var weeksText = numberOfWeeks === 1 ? 'week' : 'weeks';
			chat.sendMessage( 'Commits for the last ' + numberOfWeeks + ' ' + weeksText + ':\n' + msg );
		} );
	}
}];
