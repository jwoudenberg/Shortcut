import 'babel-core/polyfill';
import { createGame } from './engine';
import { createView } from './view';
import { on, stream } from 'flyd';

const moves = stream();
const { moves: acceptedMoves, world, errors } = createGame(moves);
const userMoves = createView(world, acceptedMoves, errors);
on(moves, userMoves);
