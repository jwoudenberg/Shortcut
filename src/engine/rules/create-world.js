import { Map } from 'immutable';
import createStartWorldState from '../create-world';

const ruleDataKey = '_unseededCreateWorldMoves';
const moveHandlers = {
    'create_game': createGame,
    'seed_create_game': seedCreateGame
};

export default function createGameRules (move, worldState) {
    const type = move.get('type');
    const moveHandler = moveHandlers[type];
    return moveHandler && moveHandler(move, worldState);
}

function createGame (move, worldState) {
    const newWorldState = (worldState || Map()).setIn([ruleDataKey, move.hashCode()], move);
    return { worldState: newWorldState };
}

function seedCreateGame (move, worldState) {
    const createWorldMovePath = [ruleDataKey, move.get('previousMoveHash')];
    const createWorldMove = worldState.getIn(createWorldMovePath);
    if (!createWorldMove) {
        return { error: 'must_seed_create_world_move' };
    }
    const seed = move.get('seed');
    const worldOptions = createWorldMove.toJS();
    const newWorldState = worldState
        .deleteIn(createWorldMovePath)
        .merge(createStartWorldState(seed, worldOptions));
    return { worldState: newWorldState };
}
