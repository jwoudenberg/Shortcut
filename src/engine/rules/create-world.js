import { Map } from 'immutable';

export default function createWorld (move, worldState) {
    if (move.get('type') !== 'create_world') {
        return null;
    }
    const createdWorldState = move.get('worldState');
    const newWorldState = (worldState || Map()).merge(createdWorldState);
    return { worldState: newWorldState };
}
