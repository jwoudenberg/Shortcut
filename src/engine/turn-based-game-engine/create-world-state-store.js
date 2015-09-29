import createKeyValueStore from './create-key-value-store';

export default function createWorldStateStore (getMove, applyRules) {

    const worldStateStore = createKeyValueStore('worldState');

    function store (moveHash, worldState) {
        worldStateStore.set(moveHash, worldState);
        console.log('World state stored:', { moveHash, worldState });
    }

    function updateWorldState (move) {
        const previousWorldState = get(move.get('previousMoveHash'));
        const { errors, worldState } = applyRules(previousWorldState, move);
        if (errors.length) {
            throw new Error('Attempting to update world with invalid move.');
        }
        store(move.hashCode(), worldState);
        return worldState;
    }

    function get (moveHash) {
        const move = getMove(moveHash);
        if (!move) {
            return null;
        }
        const worldState = worldStateStore.get(moveHash);
        return worldState ? worldState : updateWorldState(move);
    }

    return { get };
}
