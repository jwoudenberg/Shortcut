import filter from 'flyd/module/filter';
import { contains } from 'ramda';
import { Map } from 'immutable';

const movesRequiringSeed = ['take_card', 'create_game'];
const doesMoveRequireSeed = move => contains(move.get('type'), movesRequiringSeed);

export function create (moves) {
    const movesToSeed = filter(doesMoveRequireSeed, moves);
    return movesToSeed.map(move => Map({
        previousMoveHash: move.hashCode(),
        type: `seed_${move.get('type')}`,
        seed: Math.random()
    }));
}
