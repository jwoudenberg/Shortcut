const R = require('ramda');
const getNeighbours = require('./field-neighbours').getAll;

//Beware: this action removes any existing cards in the world.
function addBorder(world) {
    let cards = createBorderCards(world);
    return R.assoc('cards', cards, world);
}

const isBorderField = R.pipe(R.prop('neighbours'), R.values, R.any(R.isNil));
const keepBorderFields = R.filter(isBorderField);
const addBorderCards = R.map(createBorderCard);
function createBorderCards(world) {
    const addNeighbours = R.map(R.partial(addNeighboursToField, world));

    let board = world.board;
    if (!board) {
        throw new Error('World contains no board');
    }
    let fields = board.fields || [];
    let cards = R.pipe(addNeighbours, keepBorderFields, addBorderCards)(fields);
    return cards;
}

function addNeighboursToField(world, field) {
    let neighbours = getNeighbours(field, world);
    return R.assoc('neighbours', neighbours, field);
}

const DIRECTION_PORT_MAP = {
    bottom: [0, 1],
    right: [2, 3],
    top: [4, 5],
    left: [6, 7]
};
function createBorderCard(field) {
    let neighbours = field.neighbours;
    let ports = R.pipe(
        R.keys,
        R.reject(direction => R.isNil(neighbours[direction])),
        R.map(direction => DIRECTION_PORT_MAP[direction]),
        R.flatten
    )(neighbours);
    let paths = R.pipe(
        getCornerPaths,
        R.map(ports => ({ports}))
    )(ports);
    return {
        field: field.id,
        paths,
        rotation: 0
    };
}

const CORNER_PATHS = [ [1, 2], [3, 4], [5, 6], [7, 0] ];
const containsList = R.curry((sublist, superlist) => R.all(R.contains(R.__, superlist), sublist));
function getCornerPaths(ports) {
    return CORNER_PATHS.filter(
        R.flip(containsList)(ports)
    );
}

module.exports = addBorder;
