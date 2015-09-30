import { EventEmitter } from 'events';
import createKeyValueStore from './create-key-value-store';

export default function createMoveStore () {
    const moveStore = createKeyValueStore('moves');
    const nextMoveHashStore = createKeyValueStore('nextMoveHashes');
    const moveEvents = new EventEmitter();

    async function add (move) {
        const moveHash = move.hashCode();
        const previousMoveHash = move.get('previousMoveHash');
        const isFirstMove = !previousMoveHash;
        const previousMove = await moveStore.get(previousMoveHash);
        if (!isFirstMove && !previousMove) {
            throw new Error('Storing move failed because previous move does not exist. Hash: ' + previousMoveHash);
        }
        await moveStore.set(moveHash, move);
        if (previousMoveHash) {
            try {
                await nextMoveHashStore.set(previousMoveHash, moveHash, { overwrite: false });
            } catch({ message }) {
                return { error: message };
            }
        }
        console.log('Move stored:', { move: move.toJS() });
        moveEvents.emit('new', move);
        return {};
    }

    function get (moveHash) {
        return moveStore.get(moveHash);
    }

    function getNextHash (moveHash) {
        return nextMoveHashStore.get(moveHash);
    }

    return { add, get, getNextHash, on: moveEvents.on.bind(moveEvents, 'new') };
}
