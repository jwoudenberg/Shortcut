const parameters = require('./parameters');
const { createGame } = require('./engine');
const { createGameView, uiEvents } = require('./view');

const world = createGame(uiEvents);
createGameView(world, parameters);
