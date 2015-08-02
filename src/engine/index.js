import R from 'ramda';
import flyd from 'flyd';
import flatmap from 'flyd-flatmap';
import filter from 'flyd-filter';
import { fromJS } from 'immutable';

export function createGame(uiEvents) {
    const players = flyd.stream();
    const moves = flatmap((player) => player.moves, players);
    const { actions, world } = createWorld(moves);
    players(createPlayer(uiEvents));
    players(createGameMaster(actions));
    return { actions, world };
}

function createPlayer(uiEvents) {
    const moves = flyd.stream([uiEvents], function createMove() {
        const uiEvent = uiEvents();
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
    const gameActions = [
        getAddCardMoves(actions),
        getReplaceWorldMoves(actions),
        getFindRoutesMoves(actions)
    ].reduce(flyd.merge, flyd.stream());

    return {
        type: 'game-master',
        moves: gameActions
    };
}

import getRandomCard from './get-random-card';
function getAddCardMoves(actions) {
    const takeCardActions = filter((action) => action.type === 'take_card', actions);
    return takeCardActions.map(() => () => ({
        type: 'add_card',
        card: getRandomCard()
    }));
}

import createStartWorldState from './create-world';
function getReplaceWorldMoves(actions) {
    const createGameActions = filter((action) => action.type === 'create_game', actions);
    return createGameActions.map((action) => () => ({
        type: 'replace_world',
        world: createStartWorldState(action)
    }));
}

import { findAllRoutes } from './find-route';
function getFindRoutesMoves(actions) {
    const findRouteMoves = filter((action) => action.type === 'find_routes', actions);
    return findRouteMoves.map(() => (worldState) => ({
        type: 'found_routes',
        routes: findAllRoutes(fromJS(worldState)).toJS()
    }));
}

const actionHandlers = {
    'replace_world': function replaceWorld(action) {
        const world = action.world;
        if (!world) {
            throw new Error('replaceWorld: no world specified.');
        }
        return () => world;
    },
    'add_card': function addCard(action) {
        const card = action.card;
        if (!card) {
            throw new Error('addCard: no card specified.');
        }
        return R.evolve({
            cards: R.append(card)
        });
    },
    'rotate_card': function rotateCard(action) {
        const { cardId } = action;
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
        const { cardId, fieldId } = action;
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
    const game = flyd.scan(updateWorld, {}, moves);
    const world = flyd.stream([game], (self) => {
        //Convert old and new states to immutable.js for easy deep comparison.
        //TODO: Remove this once all engine scripts use immutable.js datastructures.
        const oldWorldState = fromJS(self() || {});
        const newWorldState = fromJS(game().worldState || {});
        if (!newWorldState.equals(oldWorldState)) {
            self(game().worldState);
        }
    });
    const actions = flyd.stream([game], () => game().lastAction);
    return { actions, world };
}

function updateWorld(gameState, move) {
    const { worldState={} } = gameState;
    const action = move(worldState);
    const actionHandler = actionHandlers[action.type];
    return {
        lastAction: action,
        worldState: actionHandler ? actionHandler(action)(worldState) : worldState
    };
}
