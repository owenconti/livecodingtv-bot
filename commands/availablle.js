var say = require('say');

module.exports = [{
    types: ['presence'],
    regex: /^available$/,
    action: (chat, stanza) => {
      console.log(stanza);
      setTimeout(() => say.speak('Victoria', stanza.user.username + ' connected bra.'), 1000)
    }
}]
