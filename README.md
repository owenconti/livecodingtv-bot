# livecodingtv-bot

## Setup

1. Clone the repo

2. Create a `credentials.js` file in the root of the app.

3. Fill in the `credentials.js` file with the following format:

```
var username = 'LCTV_USERNAME';
var password = 'CHAT_PASSWORD';
var room = 'LCTV_USER_WHERE_BOT_WILL_BE';

module.exports = {
    room: username,
    username: username,
    jid: username + '@livecoding.tv',
    password: password,
    roomJid: room + '@chat.livecoding.tv'
};
```

4. Run `npm install`

5. Run `node index.js`
