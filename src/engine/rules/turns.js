import { List, Map, Set } from 'immutable';

const ruleDataKey = '_turnData';
const turnOrderPath = [ruleDataKey, 'turnOrder'];
const moveHandlers = {
    'start_game': startGame,
    'end_turn': endTurn
};

export default function turnRules (move, worldState) {
    const type = move.get('type');
    const moveHandler = moveHandlers[type];
    return moveHandler && moveHandler(move, worldState);
}

function startGame (move, worldState) {
    const players = (worldState || Map()).get('players', Set());
    const playerNames = players.map(player => player.get('name'));
    const turnOrder = List(playerNames);
    const currentPlayer = turnOrder.first();
    const newWorldState = worldState
        .set('currentPlayer', currentPlayer)
        .setIn(turnOrderPath, turnOrder);
    return { worldState: newWorldState };
}

function endTurn (move, worldState) {
    const currentPlayer = worldState.get('currentPlayer');
    const turnOrder = worldState.getIn(turnOrderPath);
    const currentPlayerIndex = turnOrder.indexOf(currentPlayer);
    const newPlayerIndex = (currentPlayerIndex + 1) % turnOrder.size;
    const newPlayer = turnOrder.get(newPlayerIndex);
    const newWorldState = worldState.set('currentPlayer', newPlayer);
    return { worldState: newWorldState };
}
