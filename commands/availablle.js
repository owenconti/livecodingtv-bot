var say = require('say');

module.exports = [{
    types: ['presence'],
    regex: /^available$/,
    action: (chat, stanza) =>
      setTimeout(() => say.speak('Victoria', stanza.fromUsername + ' connected bra.'), 1000)
}]
