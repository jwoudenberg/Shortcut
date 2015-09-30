import 'babel-core/polyfill';
import { createGame } from './engine';
import { createView } from './view';
import { on, stream } from 'flyd';

const moves = stream();
const { moves: acceptedMoves, world } = createGame(moves);
const userMoves = createView(world, acceptedMoves);
on(moves, userMoves);
