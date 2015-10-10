import createKeyValueStore from './create-key-value-store';

export default function createWorldStateStore (getMove, applyRules) {

    const worldStateStore = createKeyValueStore('worldState');

    async function store (moveHash, worldState) {
        await worldStateStore.set(moveHash, worldState);
        console.log('World state stored:', { moveHash, worldState: worldState && worldState.toJS() });
    }

    async function updateWorldState (move) {
        const previousWorldState = await get(move.get('previousMoveHash'));
        const { errors, worldState } = applyRules(previousWorldState, move);
        if (errors.length) {
            throw new Error('Attempting to update world with invalid move.');
        }
        await store(move.hashCode(), worldState);
        return worldState;
    }

    async function get (moveHash) {
        const move = await getMove(moveHash);
        if (!move) {
            return null;
        }
        const worldState = await worldStateStore.get(moveHash);
        return worldState ? worldState : await updateWorldState(move);
    }

    return { get };
}
