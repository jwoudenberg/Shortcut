import React, { addons } from 'react/addons';
import flyd from 'flyd';
import filter from 'flyd-filter';
import R from 'ramda';
import './style.css';
import { uiEvents } from '../';
import Card from '../card';
import Field from '../field';
import Deck from '../deck';

const { CSSTransitionGroup } = addons;

export function createGame(actions, world) {
    const selectedCardId = getSelectedCardId(actions, uiEvents);
    const routes = getRoutes(world, actions, uiEvents);
    //React components stay solely responsible for rendering state. All other logic stays outside.
    return flyd.immediate(flyd.stream([world, selectedCardId, routes], () => {
        return <Game worldState={world()} selectedCardId={selectedCardId()} routes={routes()} />;
    }));
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        //TODO: make this size depend on the available screen area.
        this.state = {
            fieldSize: 100
        };
    }
    shiftFields(shift, fields) {
        const evolver = R.mapObj((shiftAmount) => R.add(shiftAmount), shift);
        return fields.map(R.evolve(evolver));
    }
    render() {
        const { worldState: { board: { fields = [] } = {}, cards = [] } = {}, routes = [] } = this.props;
        const deck = { col: 0, row: 0 };
        const shiftedFields = this.shiftFields({ col: 2 }, fields);
        //Create an optimized way to lookup fields by id.
        const fieldsById = R.fromPairs(shiftedFields.map((field) => [field.id, field]));
        const getFieldById = (fieldId) => fieldsById[fieldId] || deck;

        //Create an optimized way to lookup path color based on the path a route (might) be in.
        //DEBUG: quick and dirty color map. Replace with randomized nicer colors
        const colors = {
            '-1': null,
            '0': 'red',
            '1': 'blue',
            '2': 'green'
        };
        //DEBUG: quick test implementation, not very performant.
        const getColorByPathId = R.pipe(
            (pathId) => R.findIndex(R.containsWith(R.whereEq, pathId), routes),
            R.nth(R.__, colors)
        );

        return <div className="shortcut-game">
            {this.renderDeck(deck)}
            {shiftedFields.map(function printField(field) {
                return this.renderField(field);
            }, this)}
            <CSSTransitionGroup transitionName="unflip-card" transitionLeave={false} >
                {cards.map((card) => this.renderCard(getFieldById, getColorByPathId, card))}
            </CSSTransitionGroup>
        </div>;
    }
    renderDeck(deck) {
        return <Deck
            {...deck}
            fieldSize={this.state.fieldSize}
        />;
    }
    renderField(field) {
        const { selectedCardId } = this.props;
        const { fieldSize } = this.state;
        return <Field
            {...field}
            key={field.id}
            fieldSize={fieldSize}
            selectedCardId={selectedCardId}
        />;
    }
    renderCard(getFieldById, getColorByPathId, card) {
        const { selectedCardId } = this.props;
        const { fieldSize } = this.state;
        const cardId = card.id;
        const colouredPaths = (card.paths || []).map((path, index) => {
            const color = getColorByPathId({ cardId, pathIndex: index });
            return R.assoc('color', color, path);
        });
        const { row, col } = getFieldById(card.field);
        const extendedCard = R.merge(card, {
            key: card.id,
            paths: colouredPaths,
            selected: (selectedCardId === card.id),
            row,
            col,
            fieldSize
        });
        return <Card {...extendedCard} />;
    }
}

const isEventOfType = typeToCheck => ({ type }) => type === typeToCheck;
function getSelectedCardId(actions, uiEvents) {
    const userSelectedCardId = filter(isEventOfType('select_card'), uiEvents)
        .map(R.prop('cardId'));
    const newCardId = filter(isEventOfType('add_card'), actions)
        .map(R.path(['card', 'id']));
    const selectedCardId = flyd.merge(userSelectedCardId, newCardId);
    return selectedCardId;
}

function getRoutes(world, actions, uiEvents) {
    const latestRoutes = filter(isEventOfType('found_routes'), actions)
        .map(R.prop('routes'));
    const routes = flyd.immediate(flyd.stream([latestRoutes, world], (self, changed) => {
        if (changed[0] === world) {
            //The world changed, so our old routes are no longer valid.
            //TODO: remove uiEvent as a side effect here once uiEvent mechanism takes streams.
            uiEvents({ type: 'find_routes' });
            return [];
        }
        return latestRoutes();
    }));
    const pickedPathId = filter(isEventOfType('show_route'), uiEvents)
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
