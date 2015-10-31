import React from 'react';
import { Map, Set } from 'immutable';
import { add } from 'ramda';
import Card from '../card';
import Field from '../field';
import Deck from '../deck';

export default class Game extends React.Component {
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
