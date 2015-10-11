import React from 'react';
import flyd from 'flyd';
import filter from 'flyd/module/filter';
import R from 'ramda';
import './style.css';
import Card from '../card';
import Field from '../field';
import Deck from '../deck';

export function createGame (actions, world, events) {
    const selectedCardId = getSelectedCardId(actions, events);
    const routes = getRoutes(world, actions, events);
    //React components stay solely responsible for rendering state. All other logic stays outside.
    return flyd.immediate(flyd.stream([world, selectedCardId, routes], () => {
        return <Game
            worldState={world()}
            selectedCardId={selectedCardId()}
            routes={routes()}
            events={events}
        />;
    }));
}

class Game extends React.Component {
    constructor (props) {
        super(props);
        //TODO: make this size depend on the available screen area.
        this.state = {
            fieldSize: 100
        };
    }
    getChildContext () {
        const { events } = this.props;
        return { events };
    }
    shiftFields (shift, fields) {
        const evolver = R.mapObj((shiftAmount) => R.add(shiftAmount), shift);
        return fields.map(R.evolve(evolver));
    }
    getSpecialPaths () {
        const { worldState } = this.props;
        const { players = [] } = worldState || {};
        const specialPaths = players.reduce(addPlayerBases, {});
        return specialPaths;
    }
    render () {
        const { worldState } = this.props;
        const { board = {}, cards = [] } = worldState || {};
        const { fields = [] } = board;
        const deck = { col: 0, row: 0 };
        //Ensure we always render cards in the same order.
        const sortedCards = R.sortBy(({ id }) => id, cards);
        const shiftedFields = this.shiftFields({ col: 2 }, fields);
        //Create an optimized way to lookup fields by id.
        const fieldsById = R.fromPairs(shiftedFields.map((field) => [field.id, field]));
        const getFieldById = (fieldId) => fieldsById[fieldId] || deck;
        const specialPaths = this.getSpecialPaths();

        return <div className="shortcut-game">
            {this.renderDeck(deck)}
            {shiftedFields.map(function printField (field) {
                return this.renderField(field);
            }, this)}
            {sortedCards.map(function printField (card) {
                return this.renderCard(getFieldById, specialPaths, card);
            }, this)}
        </div>;
    }
    renderDeck (deck) {
        return <Deck
            {...deck}
            fieldSize={this.state.fieldSize}
        />;
    }
    renderField (field) {
        const { selectedCardId } = this.props;
        const { fieldSize } = this.state;
        return <Field
            {...field}
            key={field.id}
            fieldSize={fieldSize}
            selectedCardId={selectedCardId}
        />;
    }
    renderCard (getFieldById, specialPaths, card) {
        const { selectedCardId } = this.props;
        const { fieldSize } = this.state;
        const extendedPaths = (card.paths || []).map(path => {
            const { id: pathId } = path;
            const specialProps = specialPaths[pathId] || {};
            return R.merge(path, specialProps);
        });
        const { row, col } = getFieldById(card.field);
        const extendedCard = R.merge(card, {
            key: card.id,
            paths: extendedPaths,
            selected: (selectedCardId === card.id),
            row,
            col,
            fieldSize
        });
        return <Card {...extendedCard} />;
    }
}

Game.childContextTypes = {
    events: React.PropTypes.func.isRequired
};

const isEventOfType = typeToCheck => ({ type }) => type === typeToCheck;
function getSelectedCardId (actions, events) {
    const userSelectedCardId = filter(isEventOfType('select_card'), events)
        .map(R.prop('cardId'));
    const newCardId = filter(isEventOfType('add_card'), actions)
        .map(R.path(['card', 'id']));
    const selectedCardId = flyd.merge(userSelectedCardId, newCardId);
    return selectedCardId;
}

function getRoutes (world, actions, events) {
    const latestRoutes = filter(isEventOfType('found_routes'), actions)
        .map(R.prop('routes'));
    const routes = flyd.immediate(flyd.stream([latestRoutes, world], (self, changed) => {
        if (changed[0] === world) {
            //The world changed, so our old routes are no longer valid.
            events({ type: 'find_routes' });
            return [];
        }
        return latestRoutes();
    }));
    const pickedPathId = filter(isEventOfType('show_route'), events)
        .map(R.prop('pathId'));
    const pickedRoutes = flyd.stream([routes, pickedPathId], () => {
        const pickedRoute = R.find(
            R.containsWith(
                R.whereEq,
                pickedPathId()
            ),
            routes()
        );
        return pickedRoute ? [pickedRoute] : [];
    });
    return pickedRoutes;
}

function addPlayerBases (specialPaths, player) {
    const { bases = [], name: playerName } = player;
    const addPlayerBase = (_specialPaths, pathId) => R.assoc(pathId, { baseFor: playerName }, _specialPaths);
    return bases.reduce(addPlayerBase, specialPaths);
}
