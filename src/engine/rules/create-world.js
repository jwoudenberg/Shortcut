export default function createWorld (move) {
    if (move.get('type') !== 'create_world') {
        return null;
    }
    const worldState = move.get('worldState');
    return { worldState };
}
