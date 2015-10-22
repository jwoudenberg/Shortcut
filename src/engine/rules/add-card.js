import { Set, Map } from 'immutable';
import getRandomCard from '../get-random-card';

const ruleDataKey = '_unseededAddCardMoves';
const moveHandlers = {
    'take_card': takeCard,
    'seed_take_card': seedTakeCard
};

export default function takingCardRules (move, worldState) {
    const type = move.get('type');
    const moveHandler = moveHandlers[type];
    return moveHandler && moveHandler(move, worldState);
}

function takeCard (move, worldState) {
    const newWorldState = (worldState || Map()).setIn([ruleDataKey, move.hashCode()], move);
    return { worldState: newWorldState };
}

function seedTakeCard (move, worldState) {
    const addCardMovePath = [ruleDataKey, move.get('previousMoveHash')];
    const addCardMove = worldState.getIn(addCardMovePath);
    if (!addCardMove) {
        return { error: 'must_seed_add_card_move' };
    }
    const seed = move.get('seed');
    const newCard = getRandomCard(seed);
    const newWorldState = worldState
        .deleteIn(addCardMovePath)
        .update('cards', Set(), cards => cards.add(newCard));
    return { worldState: newWorldState };
}
