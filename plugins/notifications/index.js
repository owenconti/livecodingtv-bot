const path = require('path');
const notifier = require('node-notifier');

module.exports = [{
	types: ['message'],
	regex: /\w/,
	action: (chat, stanza) => {
    if(!stanza.user.isBot()) {
      notifier.notify({
        title: stanza.user.username,
        message: stanza.message,
        sound: true,
        icon: path.join(__dirname, '../../setup/core/assets/tswift.png'), // absolute path (not balloons) 
      }, (err, response) => {
        // response is response from notification
        console.log(err);
      });
    }
	}
}, {
	types: ['startup'],
	action: (chat, stanza) => {
		console.log( 'Starting the notification plugin' );
	}
}];
