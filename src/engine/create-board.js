import { Map, Set } from 'immutable';
import { range, xprod, apply } from 'ramda';
import { v4 as uuid } from 'node-uuid';

export default function addBoardToWorld (boardProperties) {
    const {width, height} = boardProperties;
    if (!width || !height) {
        throw new Error('Invalid board size: ' + [width, height].join(','));
    }
    const rows = range(0, height);
    const cols = range(0, width);
    const coords = xprod(rows, cols);
    const fields = Set(coords.map(apply(makeField)));
    const board = Map({ fields });
    return board;
}

function makeField (row, col) {
    const id = uuid();
    return Map({id, row, col});
}
