module.exports = createGame;

const R = require('ramda');
const Kefir = require('kefir');

const isAction = R.curry((action, event) => action === event.action);
function createGame(events) {
    const actions = [
        events.filter(isAction('create_game')).map(createWorld),
        events.filter(isAction('take_card')).map(addRandomCard),
        events.filter(isAction('rotate_card')).map(rotateCard)
    ];
    let stateChanges = Kefir.merge(actions);
    let state = stateChanges.scan((previous, modifier) => modifier(previous), {}).changes();
    return state;
}

/* Create world action */
const _createWorld = require('./create-world');
function createWorld(options) {
    let world = _createWorld(options);
    return () => world;
}

const getRandomCard = require('./get-random-card');
function addRandomCard() {
    let card = getRandomCard();
    return R.evolve({
        cards: R.append(card)
    });
}

function rotateCard(options) {
    let { cardId } = options;
    return R.evolve({
        cards: R.map(R.ifElse(
            R.propEq('id', cardId),
            R.evolve({ rotation: R.add(90) }),
            R.identity
        ))
    });
}
