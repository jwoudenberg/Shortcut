const { createGame } = require('./engine');
const { createView } = require('./view');
const { on, stream } = require('flyd');

const moves = stream();
const { moves: acceptedMoves, world } = createGame(moves);
const userMoves = createView(world, acceptedMoves);
on(moves, userMoves);
