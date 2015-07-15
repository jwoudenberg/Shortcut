module.exports = createGame;

const R = require('ramda');
const flyd = require('flyd');
const createWorld = require('./create-world');
const getRandomCard = require('./get-random-card');

/* actions */
const gameEventHandlers = {
    'create_game': function _createWorld(event) {
        let world = createWorld(event);
        return () => world;
    },
    'take_card': function addRandomCard() {
        let card = getRandomCard();
        return R.evolve({
            cards: R.append(card)
        });
    },
    'rotate_card': function rotateCard(event) {
        let { cardId } = event;
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
    'move_card': function moveCard(event) {
        let { cardId, fieldId } = event;
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

function createGame(events) {
    let stateChanges = flyd.stream([events], function applyHandler(changes) {
        let event = events();
        let handler = gameEventHandlers[event.action];
        if (handler) {
            changes(handler(event));
        }
    });
    let state = flyd.scan((previous, modifier) => modifier(previous), {}, stateChanges);
    return state;
}
