require('babelify/polyfill');
const parameters = require('./parameters');
const { createGame } = require('./engine');
const { createGameView, uiEvents } = require('./view');

const { actions, world } = createGame(uiEvents);
createGameView(world, actions, parameters);
