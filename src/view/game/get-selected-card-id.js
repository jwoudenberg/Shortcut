import { stream, merge } from 'flyd';
import filter from 'flyd/module/filter';
import { prop } from 'ramda';
import { Set } from 'immutable';

const isEventOfType = typeToCheck => ({ type }) => type === typeToCheck;

export default function getSelectedCardId (world, events) {
    const userSelectedCardId = filter(isEventOfType('select_card'), events)
        .map(prop('cardId'));
    const newestCardId = getNewestCardId(world);
    const selectedCardId = merge(userSelectedCardId, newestCardId);
    return selectedCardId;
}

function getNewestCardId (world) {
    const cardIds = world.map((worldState = Map()) => {
        const cards = worldState.get('cards', Set());
        return cards.map(card => card.get('id'));
    });
    const previousCardIds = previous(cardIds);
    const newestCardId = stream([cardIds, previousCardIds], self => {
        const newCardId = cardIds()
            .subtract(previousCardIds() || Set())
            .first();
        if (newCardId) {
            self(newCardId);
        }
    });
    return newestCardId;
}

function previous (s) {
    let previousValue;
    return stream([s], self => {
        self(previousValue);
        previousValue = s();
    });
};
