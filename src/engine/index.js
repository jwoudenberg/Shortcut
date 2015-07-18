module.exports = { createGame };

const R = require('ramda');
const flyd = require('flyd');
const flatmap = require('flyd-flatmap');
const filter = require('flyd-filter');

function createGame(uiEvents) {
    let players = flyd.stream();
    let moves = flatmap((player) => player.moves, players);
    let { actions, world } = createWorld(moves);
    players(createPlayer(uiEvents));
    players(createGameMaster(actions));
    return { actions, world };
}

function createPlayer(uiEvents) {
    let moves = flyd.stream([uiEvents], function createMove() {
        let uiEvent = uiEvents();
        //TODO: add validation here.
        return () => uiEvent;
    });
    return {
        type: 'human',
        name: 'player A',
        moves
    };
}

function createGameMaster(actions) {
    let gameActions = [
        getAddCardMoves(actions),
        getReplaceWorldMoves(actions)
    ].reduce(flyd.merge, flyd.stream());

    return {
        type: 'game-master',
        moves: gameActions
    };
}

const getRandomCard = require('./get-random-card');
function getAddCardMoves(actions) {
    let takeCardActions = filter((action) => action.type === 'take_card', actions);
    return takeCardActions.map(() => () => ({
        type: 'add_card',
        card: getRandomCard()
    }));
}

const createStartWorldState = require('./create-world');
function getReplaceWorldMoves(actions) {
    let createGameActions = filter((action) => action.type === 'create_game', actions);
    return createGameActions.map((action) => () => ({
        type: 'replace_world',
        world: createStartWorldState(action)
    }));
}

const actionHandlers = {
    'replace_world': function replaceWorld(action) {
        let world = action.world;
        if (!world) {
            throw new Error('replaceWorld: no world specified.');
        }
        return () => world;
    },
    'add_card': function addCard(action) {
        let card = action.card;
        if (!card) {
            throw new Error('addCard: no card specified.');
        }
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

function createWorld(moves) {
    let game = flyd.scan(updateWorld, {}, moves);
    let world = flyd.stream([game], () => game().worldState);
    let actions = flyd.stream([game], () => game().lastAction);
    return { actions, world };
}

function updateWorld(gameState, move) {
    let { worldState={} } = gameState;
    let action = move(worldState);
    let actionHandler = actionHandlers[action.type];
    return {
        lastAction: action,
        worldState: actionHandler ? actionHandler(action)(worldState) : worldState
    };
}
