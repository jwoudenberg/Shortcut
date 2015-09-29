import createWorldStateStore from './create-world-state-store';
import setupRules from './setup-rules';
import createMoveStore from './create-move-store';

export function create (rulesDefinitions) {
    const moveStore = createMoveStore();
    const rules = setupRules(rulesDefinitions);
    const { get: getWorldState } = createWorldStateStore(moveStore.get, rules.apply);

    function makeMove (move) {
        console.log('Received new move:', { move: move.toJS() });
        const moveHash = move.hashCode();
        const moveAlreadyExists = !!moveStore.getNextHash(moveHash);
        if (moveAlreadyExists) {
            return { error: 'follow_up_move_already_exists' };
        }
        const worldState = getWorldState(move.get('previousMoveHash'));
        const { errors } = rules.apply(worldState, move);
        if (errors.length) {
            return { error: errors[0] };
        }
        const { error } = moveStore.add(move);
        return { error };
    }

    return { makeMove, getWorldState, onMove: moveStore.on };
}
