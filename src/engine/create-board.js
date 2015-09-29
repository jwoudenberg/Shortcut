const R = require('ramda');
const uuid = require('node-uuid').v4;

function addBoardToWorld (boardProperties) {
    let {width, height} = boardProperties;
    if (!width || !height) {
        throw new Error('Invalid board size: ' + [width, height].join(','));
    }
    let rows = R.range(0, height);
    let cols = R.range(0, width);
    let coords = R.xprod(rows, cols);
    let fields = coords.map(R.apply(makeField));
    let board = { fields };
    return board;
}

function makeField (row, col) {
    let id = uuid();
    return {id, row, col};
}

module.exports = addBoardToWorld;
