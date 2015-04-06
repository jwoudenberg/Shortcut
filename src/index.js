const React = require('react');
const Game = require('./view/components').Game;
const addBoardToWorld = require('./logic/add-board-to-world');

//TODO: replace constant world object with real one.
let world = addBoardToWorld({ width: 5, height: 5 }, { cards: [] });
//DEBUG: place build a border around the board.
const addBorder = require('./logic/add-border-to-board');
world = addBorder(world);

// //DEBUG: place a random card in every field.
// const getRandomCard = require('./logic/get-random-card');
// world.cards = world.board.fields.map(function createCard(field) {
//     let card = getRandomCard();
//     card.field = field.id;
//     return card;
// });

React.render(<Game world={world} />, document.getElementById('playground'));
