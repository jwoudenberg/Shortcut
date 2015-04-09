const createBoard = require('./create-board');
const addBorder = require('./add-border-to-board');
const Promise = require('bluebird');

function createWorld(options) {
    let { boardSize } = options;
    let boardSizeWithBorders = boardSize + 2;
    let board = createBoard({ width: boardSizeWithBorders, height: boardSizeWithBorders });
    let cards = [];
    let world = addBorder({ board, cards });
    return Promise.resolve(world);
}

module.exports = createWorld;
