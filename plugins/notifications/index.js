const notifier = require('node-notifier');

module.exports = [{
	types: ['message'],
	regex: /\*/,
	action: function(chat, stanza) {
    if(!stanza.user.isBot()) {
      notifier.notify({
        title: stanza.user.username,
        message: stanza.message,
        icon: path.join(__dirname, '../../assets/Such_doge_Large.png'), // absolute path (not balloons) 
      }, function (err, response) {
        // response is response from notification
        console.log(err);
      });
    }
	}
}, {
	types: ['startup'],
	action: function(chat, stanza) {
		console.log( 'Starting the notification plugin' );
	}
}];
