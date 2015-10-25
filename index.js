'use strict';

/**
 * LCTV Bot :)
 */

const credentials = require('./credentials');
const Brain = require('./utils/Brain');
const ChatBot = require('./ChatBot');

// Build the initial runtime object
let runtime = require('./utils/Runtime');
runtime.debug = process.argv[2] === 'debug' || false;
runtime.coreCommands = null;
runtime.pluginCommands = null;
runtime.websocketCommands = null;
runtime.startUpTime = new Date().getTime();
runtime.credentials = credentials;
runtime.brain = Brain;

Brain.start( __dirname + '/brain' );
ChatBot.start();
