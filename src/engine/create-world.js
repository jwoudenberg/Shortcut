import { Set, Map } from 'immutable';
import { partial } from 'ramda';
import createBoard from './create-board';
import addBorder from './add-border-to-board';
import { getUuidGenerator } from './rules/world-state-utils';

export default function createWorld (seed, options) {
    const uuidGenerator = getUuidGenerator(seed);
    const { boardSize } = options;
    const boardSizeWithBorders = boardSize + 2;
    const board = createBoard(uuidGenerator, { width: boardSizeWithBorders, height: boardSizeWithBorders });
    const cards = Set();
    const world = Map({ board, cards });
    return world.update(partial(addBorder, uuidGenerator));
}
