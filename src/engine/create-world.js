import { Set, Map } from 'immutable';
import createBoard from './create-board';
import addBorder from './add-border-to-board';

export default function createWorld (options) {
    const { boardSize } = options;
    const boardSizeWithBorders = boardSize + 2;
    const board = createBoard({ width: boardSizeWithBorders, height: boardSizeWithBorders });
    const cards = Set();
    const world = Map({ board, cards });
    return world.update(addBorder);
}
