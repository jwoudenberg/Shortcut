import flyd from 'flyd';
import filter from 'flyd/module/filter';
import { Map } from 'immutable';
import getRandomCard from './get-random-card';
import createStartWorldState from './create-world';

export function create (moves) {
    const gameMasterMoves = [
        getAddCardMoves(moves),
        getReplaceWorldMoves(moves)
    ].reduce(flyd.merge, flyd.stream());
    return gameMasterMoves;
}

function getAddCardMoves (moves) {
    const takeCardMoves = filter((move) => move.get('type') === 'take_card', moves);
    return takeCardMoves.map(move => Map({
        previousMoveHash: move.hashCode(),
        type: 'add_card',
        card: getRandomCard()
    }));
}

function getReplaceWorldMoves (moves) {
    const createGameMoves = filter((move) => move.get('type') === 'create_game', moves);
    return createGameMoves.map(move => Map({
        previousMoveHash: move.hashCode(),
        type: 'create_world',
        worldState: createStartWorldState(move.toJS())
    }));
}
