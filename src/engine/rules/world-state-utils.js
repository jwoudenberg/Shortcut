import { Map, Set } from 'immutable';

export function updateCardAtCoords (worldState, coords, updater) {
    const field = getFieldAtCoords(worldState, coords);
    if (!field) {
        return worldState;
    }
    const fieldId = field.get('id');
    const isCardInField = card => (card.get('field') === fieldId);
    return updateCard(worldState, isCardInField, updater);
}

export function updateCardWithId (worldState, cardId, updater) {
    const isCardWithId = card => (card.get('id') === cardId);
    return updateCard(worldState, isCardWithId, updater);
}

describe(updateCardWithId.name, () =>
    it('updates the right card', () => {
        const card1 = Map({ id: 'foo' });
        const card2 = Map({ id: 'bar' });
        const worldState = Map({ cards: Set([card1, card2]) });
        const updater = card => card.set('updated', true);
        const actualNewState = updateCardWithId(worldState, 'foo', updater);
        const expectedNewState = Map({ cards: Set([updater(card1), card2]) });
        require('assert')(actualNewState.equals(expectedNewState), 'The right card is updated.');
    })
);

export function updateCard (worldState, predicate, updater) {
    return worldState.update('cards', Set(), cards => {
        const card = cards.find(predicate);
        if (!card) {
            return cards;
        }
        const updatedCard = updater(card);
        return cards.delete(card).add(updatedCard);
    });
}

function getFieldAtCoords (worldState, coords) {
    const { row, col } = coords;
    const fields = worldState.getIn(['board', 'fields'], Set());
    return fields.find(field => {
        return field.get('row') === row && field.get('col') === col;
    });
}
