import { Map, Set } from 'immutable';
import { range, xprod } from 'ramda';

export default function addBoardToWorld (uuidGenerator, boardProperties) {
    const {width, height} = boardProperties;
    if (!width || !height) {
        throw new Error('Invalid board size: ' + [width, height].join(','));
    }
    const rows = range(0, height);
    const cols = range(0, width);
    const coords = xprod(rows, cols);
    const fields = Set(coords.map(([row, col]) => makeField(uuidGenerator, row, col)));
    const board = Map({ fields });
    return board;
}

function makeField (uuidGenerator, row, col) {
    const { value: id } = uuidGenerator.next();
    return Map({id, row, col});
}

