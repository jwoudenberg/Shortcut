import { Set, Map } from 'immutable';
import { evolve, inc, dec, partial, converge } from 'ramda';

const POSITION_MODIFIERS = {
    'left': evolve({ col: dec }),
    'right': evolve({ col: inc }),
    'up': evolve({ row: dec }),
    'down': evolve({ row: inc })
};
function getNeighbour (direction, field, worldState) {
    const positionModifier = POSITION_MODIFIERS[direction];
    if (!positionModifier) {
        throw new Error(`Unknown direction ${direction}`);
    }
    const board = worldState.get('board');
    if (!board) {
        throw new Error('World contains no board');
    }
    const fields = board.get('fields', Set());
    const fieldCoords = {
        row: field.get('row'),
        col: field.get('col')
    };
    const neighbourCoords = positionModifier(fieldCoords);
    const { row, col } = neighbourCoords;
    const isNeighbourField = field => (field.get('row') === row) && (field.get('col') === col);
    const neighbourField = fields.find(isNeighbourField);
    return neighbourField;
}

export const getLeft = partial(getNeighbour, 'left');
export const getRight = partial(getNeighbour, 'right');
export const getTop = partial(getNeighbour, 'up');
export const getBottom = partial(getNeighbour, 'down');
export const getAll = converge(
    (left, right, top, bottom) => Map({left, right, top, bottom}),
    getLeft,
    getRight,
    getTop,
    getBottom
);
