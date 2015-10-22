import { Set } from 'immutable';
import Random from 'random-js';

export function* getUuidGenerator (seed) {
    const intSeed = Math.floor(seed * Math.pow(2, 32));
    const randomEngine = Random.engines.mt19937().seed(intSeed);
    while (true) {
        yield Random.uuid4(randomEngine);
    }
}

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
