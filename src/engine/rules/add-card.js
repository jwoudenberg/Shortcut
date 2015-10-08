import { Set } from 'immutable';

export default function takingCardRules (move, worldState) {
    if (move.get('type') !== 'add_card') {
        return null;
    }
    const card = move.get('card');
    const newWorldState = worldState.update('cards', Set(), cards => cards.add(card));
    return { worldState: newWorldState };
}
