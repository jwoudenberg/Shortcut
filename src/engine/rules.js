import R from 'ramda';

export function rotateCard (move, worldState) {
    const { type, cardId } = move.toJS();
    if (type !== 'rotate_card') {
        return null;
    }
    if (!cardId) {
        throw new Error('rotateCard: no cardId provided.');
    }
    const newWorldState = R.evolve({
        cards: R.map(R.ifElse(
            R.propEq(cardId, 'id'),
            R.evolve({ rotation: R.add(90) }),
            R.identity
        ))
    }, worldState);
    return { worldState: newWorldState };
}

export function moveCard (move, worldState) {
    const { type, cardId, fieldId } = move.toJS();
    if (type !== 'move_card') {
        return null;
    }
    if (!cardId) {
        throw new Error('moveCard: no cardId provided.');
    }
    if (!fieldId) {
        throw new Error('moveCard: no fieldId provided.');
    }
    const newWorldState = R.evolve({
        cards: R.map(R.ifElse(
            R.propEq(cardId, 'id'),
            R.assoc('field', fieldId),
            R.identity
        ))
    }, worldState);
    return { worldState: newWorldState };
}

export function replaceWorld (move) {
    const { type, worldState } = move.toJS();
    if (type !== 'replace_world') {
        return null;
    }
    if (!worldState) {
        throw new Error('replaceWorld: no world specified.');
    }
    return { worldState };
}

export function addCard (move, worldState) {
    const { type, card } = move.toJS();
    if (type !== 'add_card') {
        return null;
    }
    if (!card) {
        throw new Error('addCard: no card specified.');
    }
    const newWorldState = R.evolve({
        cards: R.append(card)
    }, worldState);
    return { worldState: newWorldState };
}
