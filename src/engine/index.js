module.exports = { createGame };

const R = require('ramda');
const flyd = require('flyd');
const createWorld = require('./create-world');
const getRandomCard = require('./get-random-card');

const actionHandlers = {
    'create_game': function _createWorld(action) {
        let world = createWorld(action);
        return () => world;
    },
    'take_card': function addRandomCard() {
        let card = getRandomCard();
        return R.evolve({
            cards: R.append(card)
        });
    },
    'rotate_card': function rotateCard(action) {
        let { cardId } = action;
        if (!cardId) {
            throw new Error('rotateCard: no cardId provided.');
        }
        return R.evolve({
            cards: R.map(R.ifElse(
                R.propEq(cardId, 'id'),
                R.evolve({ rotation: R.add(90) }),
                R.identity
            ))
        });
    },
    'move_card': function moveCard(action) {
        let { cardId, fieldId } = action;
        if (!cardId) {
            throw new Error('moveCard: no cardId provided.');
        }
        if (!fieldId) {
            throw new Error('moveCard: no fieldId provided.');
        }
        return R.evolve({
            cards: R.map(R.ifElse(
                R.propEq(cardId, 'id'),
                R.assoc('field', fieldId),
                R.identity
            ))
        });
    }
};

function createGame(actions) {
    let worldState = flyd.stream([actions], function applyHandler(self) {
        let action = actions();
        let handler = actionHandlers[action.action];
        if (handler) {
            self(handler(action));
        }
    });
    let world = flyd.scan((previous, modifier) => modifier(previous), {}, worldState);
    return world;
}
