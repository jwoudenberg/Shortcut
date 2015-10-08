import { List, Map } from 'immutable';
import { mathMod as mod, identity as id, inc, dec } from 'ramda';
import { updateCardAtCoords } from './world-state-utils';

const ruleDataKey = '_playerleData';
const boardSizePath = [ruleDataKey, 'boardSize'];
const baseCandidatesPath = [ruleDataKey, 'baseCandidates'];
const moveHandlers = {
    'create_game': createGame,
    'add_player': addPlayer
};
export default function playerRules (move, worldState) {
    const type = move.get('type');
    const moveHandler = moveHandlers[type];
    return moveHandler && moveHandler(move, worldState);
}

function createGame (move, worldState) {
    const { boardSize } = move;
    return worldState.setIn(boardSizePath, boardSize);
}

function addPlayer (move, worldState) {
    if (willExceedMaxPlayerSize(worldState)) {
        return { error: 'maximum amount of players exceeded' };
    }
    const { name } = move;
    const newPlayer = Map({
        name
    });
    return worldState
        .update('players', List(), players => players.push(newPlayer))
        .update(addBases);
}

function addBases (worldState) {
    const boardSize = worldState.getIn(boardSizePath);
    const baseCandidates = List(baseCandidates(boardSize));
    const players = worldState.get('players', List());
    const playerHasBases = player => player.has('bases');
    const playersWithoutBases = players.filter(playerHasBases);
    const newWorldState = playersWithoutBases.reduce(addBasesForPlayer, worldState);
    return newWorldState;
}

function addBasesForPlayer (worldState, player) {
    const baseCandidates = worldState.get(baseCandidatesPath) || generateBaseCandidates(worldState);
    const positionList = baseCandidatesPath
        .slice(0, baseCandidates.size / 2)
        .map(candidate => !candidate);
    const baseIndex = getMostIsolatedIndex(positionList);
    const playerBaseCoords = [
        baseCandidates[baseIndex],
        baseCandidates[baseIndex + baseCandidates.size / 2]
    ];
    const newWorldState = playerBaseCoords.reduce(function addBase (worldState, { row, col, port }) {
        return updateCardAtCoords(worldState, { row, col }, card => addPathToCard(card, [port]));
    }, worldState);
    return newWorldState;
}

function addPathToCard (card, ports) {
    const path = Map({
        ports: List(ports)
    });
    return card.update('paths', List(), paths => {
        return paths.push(path);
    });
}

//Get the index of the falsy value in a cyclical list most isolated from truthy values.
//Example: [false, true, false, false, true, false, false] => 6
function getMostIsolatedIndex (positions) {
    const startIndex = positions.findIndex(id) + 1;
    const areAllPositionsFree = (startIndex === -1);
    if (areAllPositionsFree) {
        return 0;
    }
    //Ensure we start on a free spot just after a taken position, so we're guaranteed to end on a taken position.
    const shiftedIndexes = [...generateShiftedInterval(positions.size, startIndex)];
    const { mostIsolatedIndex } = shiftedIndexes.reduce((state, index) => {
        let { currentIntervalSize, maxIntervalSize, mostIsolatedIndex } = state;
        const isEnd = (index === positions.size);
        const isIndexTaken = isEnd || positions.get(index);
        if (isIndexTaken) {
            if (currentIntervalSize > maxIntervalSize) {
                maxIntervalSize = currentIntervalSize;
                mostIsolatedIndex = mod(Math.floor(index - maxIntervalSize / 2), positions.size);
            }
            currentIntervalSize = 0;
        } else {
            currentIntervalSize++;
        }
        return { currentIntervalSize, maxIntervalSize, mostIsolatedIndex };
    }, { currentIntervalSize: 0, maxIntervalSize: 0, mostIsolatedIndex: null });
    return mostIsolatedIndex;
}

//Generate a shifted interval.
//Example: (5, 2) => [2, 3, 4, 0, 1].
function* generateShiftedInterval (intervalSize, startIndex = 0) {
    let currentIndex = startIndex;
    do {
        yield currentIndex;
        currentIndex = (currentIndex + 1) % intervalSize;
    } while (currentIndex !== startIndex)
}

function willExceedMaxPlayerSize (worldState) {
    const boardSize = worldState.getIn(boardSizePath);
    const maxPlayers = getMaxPlayers(boardSize);
    const newAmountOfPlayers = 1 + worldState.get('players', List()).size;
    const willExceedMaxPlayerSize = (newAmountOfPlayers > maxPlayers);
    return willExceedMaxPlayerSize;
}

function getMaxPlayers (boardSize) {
    return (boardSize - 2) * 4;
}

function* generateBaseCandidates (worldState) {
    const boardSize = worldState.getIn(boardSizePath);
    const startCoords = Map({ row: 0, col: 0 });
    const directionsGen = walkBorderDirections();
    const isCorner = coords => coords.every(coord => (coord === 0 || coord === boardSize));
    const portsByDirection = {
        'right': [0, 1],
        'down': [2, 3],
        'left': [4, 5],
        'up': [6, 7]
    };
    yield* (function* nextBaseCandidate (coords, direction) {
        if (isCorner(coords)) {
            direction = directionsGen.next().value;
            if (!direction) {
                return null;
            }
        } else {
            //TODO: calculate the ports based on the direction.
            const ports = portsByDirection[direction];
            yield coords.set('port', ports[0]);
            yield coords.set('port', ports[1]);
        }
        const newCoords = move(direction, coords);
        yield* nextBaseCandidate(newCoords, direction);
    }(startCoords));

}

function* walkBorderDirections () {
    yield 'right';
    yield 'down';
    yield 'left';
    yield 'up';
}

function move (direction, coords) {
    return coords
        .update('row', { down: inc, right: id, up: dec, left: id }[direction])
        .update('col', { down: id, right: inc, up: id, left: dec }[direction]);
}
