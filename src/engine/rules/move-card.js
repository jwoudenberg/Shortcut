import { updateCardWithId } from './world-state-utils';

export default function cardMovementRules (move, worldState) {
    if (move.get('type') !== 'move_card') {
        return null;
    }
    const fieldId = move.get('fieldId');
    const moveCard = card => card.set('field', fieldId);
    const cardId = move.get('cardId');
    const newWorldState = updateCardWithId(worldState, cardId, moveCard);
    return { worldState: newWorldState };
}
