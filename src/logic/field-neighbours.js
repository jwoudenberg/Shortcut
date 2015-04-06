const R = require('ramda');

const POSITION_MODIFIERS = {
    'left': R.evolve({ col: R.dec }),
    'right': R.evolve({ col: R.inc }),
    'up': R.evolve({ row: R.dec }),
    'down': R.evolve({ row: R.inc })
};
function getNeighbour(direction, field, world) {
    let positionModifier = POSITION_MODIFIERS[direction];
    if (!positionModifier) {
        throw new Error(`Unknown direction ${direction}`);
    }
    let board = world.board;
    if (!board) {
        throw new Error('World contains no board');
    }
    let fields = board.fields || [];
    let coordinates = R.pick(['row', 'col'], field);
    let neighbourCoordinates = positionModifier(coordinates);
    let neighbour = R.find(R.where(neighbourCoordinates), fields);
    return neighbour;
}

let getNeighbourCurried = R.curry(getNeighbour);

let getLeft = getNeighbourCurried('left');
let getRight = getNeighbourCurried('right');
let getTop = getNeighbourCurried('up');
let getBottom = getNeighbourCurried('down');
let getAll = R.converge(
    (left, right, top, bottom) => ({left, right, top, bottom}),
    getLeft,
    getRight,
    getTop,
    getBottom
);

module.exports = {getLeft, getRight, getTop, getBottom, getAll};
