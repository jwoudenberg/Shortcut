import { add } from 'ramda';
import { updateCardWithId } from './world-state-utils';

const rotateCard = card => card.update('rotation', 0, add(90));

export default function cardRotationRules (move, worldState) {
    const type = move.get('type');
    if (type !== 'rotate_card') {
        return null;
    }
    const cardId = move.get('cardId');
    const newWorldState = updateCardWithId(worldState, cardId, rotateCard);
    return { worldState: newWorldState };
}
