import React from 'react';
import flyd from 'flyd';
import filter from 'flyd/module/filter';
import { Map, Set } from 'immutable';
import { add, prop, containsWith, whereEq } from 'ramda';
import './style.css';
import Card from '../card';
import Field from '../field';
import Deck from '../deck';

export function createGame (actions, world, events) {
    const selectedCardId = getSelectedCardId(actions, events);
    const routes = getRoutes(world, actions, events);
    //TODO: make this size depend on the available screen area.
    const fieldSize = 100;
    //React components stay solely responsible for rendering state. All other logic stays outside.
    return flyd.immediate(flyd.stream([world, selectedCardId, routes], () => {
        return <Game
            fieldSize={fieldSize}
            worldState={world()}
            selectedCardId={selectedCardId()}
            routes={routes()}
            events={events}
        />;
    }));
}

class Game extends React.Component {
    getChildContext () {
        const { events, selectedCardId, fieldSize } = this.props;
        return { events, selectedCardId, fieldSize };
    }
    shiftFields ({ row = 0, col = 0 }, fields) {
        const shiftField = field => field.update('row', add(row)).update('col', add(col));
        return fields.map(shiftField);
    }
    getSpecialPaths (worldState) {
        const players = worldState.get('players', Set());
        const addPlayerPaths = (_specialPaths, player) => _specialPaths.merge(this.getSpecialPathsForPlayer(player));
        const specialPaths = players.reduce(addPlayerPaths, Map());
        return specialPaths;
    }
    getSpecialPathsForPlayer = (player) => {
        const playerName = player.get('name');
        const bases = player.get('bases', Set());
        const addPlayerBase = (specialPaths, pathId) => specialPaths.set(pathId, Map({ baseFor: playerName }));
        return bases.reduce(addPlayerBase, Map());
    }
    render () {
        const { worldState = Map() } = this.props;
        const board = worldState.get('board', Map());
        const fields = board.get('fields', Set());
        const cards = worldState.get('cards', Set());
        const deck = Map({ col: 0, row: 0 });
        //Ensure we always render cards in the same order.
        const sortedCards = cards.sortBy(card => card.get('id'));
        const shiftedFields = this.shiftFields({ col: 2 }, fields);
        //Create an optimized way to lookup fields by id.
        const fieldsById = Map(
            shiftedFields.map(field => [field.get('id'), field])
        );
        const getFieldById = fieldId => fieldsById.get(fieldId, deck);
        const specialPaths = this.getSpecialPaths(worldState);

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
        return <Deck data={deck} />;
    }
    renderField (field) {
        return <Field
            data={field}
            key={field.get('id')}
        />;
    }
    renderCard (getFieldById, specialPaths, card) {
        const { selectedCardId } = this.props;
        const extendPath = path => {
            const pathId = path.get('id');
            const specialProps = specialPaths.get(pathId, Map());
            return path.merge(specialProps);
        };
        const field = getFieldById(card.get('field'));
        const extendedCard = card
            .update('paths', Set(), paths => paths.map(extendPath))
            .set('row', field.get('row'))
            .set('col', field.get('col'))
            .set('selected', (selectedCardId === card.get('id')));
        return <Card data={extendedCard} key={card.get('id')} />;
    }
}

Game.childContextTypes = {
    events: React.PropTypes.func.isRequired,
    fieldSize: React.PropTypes.number.isRequired,
    selectedCardId: React.PropTypes.string
};

const isEventOfType = typeToCheck => ({ type }) => type === typeToCheck;
function getSelectedCardId (actions, events) {
    const userSelectedCardId = filter(isEventOfType('select_card'), events)
        .map(prop('cardId'));
    const selectedCardId = flyd.merge(userSelectedCardId);
    return selectedCardId;
}

function getRoutes (world, actions, events) {
    const latestRoutes = filter(isEventOfType('found_routes'), actions)
        .map(prop('routes'));
    const routes = flyd.immediate(flyd.stream([latestRoutes, world], (self, changed) => {
        if (changed[0] === world) {
            //The world changed, so our old routes are no longer valid.
            events({ type: 'find_routes' });
            return [];
        }
        return latestRoutes();
    }));
    const pickedPathId = filter(isEventOfType('show_route'), events)
        .map(prop('pathId'));
    const pickedRoutes = flyd.stream([routes, pickedPathId], () => {
        const pickedRoute = find(
            containsWith(
                whereEq,
                pickedPathId()
            ),
            routes()
        );
        return pickedRoute ? [pickedRoute] : [];
    });
    return pickedRoutes;
}
