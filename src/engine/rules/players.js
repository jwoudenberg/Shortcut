import { Set, List, Map } from 'immutable';
import { mathMod as mod, identity as id, inc, dec, partial } from 'ramda';
import { updateCardAtCoords } from './world-state-utils';

const ruleDataKey = '_playerData';
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
    const boardSize = move.get('boardSize');
    const baseCandidates = List([...generateBaseCandidates(boardSize)]);
    const newWorldState = (worldState || Map())
        .setIn(baseCandidatesPath, baseCandidates);
    return { worldState: newWorldState };
}

function addPlayer (move, worldState) {
    const name = move.get('name');
    const newPlayer = Map({
        name
    });
    return worldState
        .update('players', Set(), players => players.add(newPlayer))
        .update(addBases);
}

function addBases (worldState) {
    const players = worldState.get('players', Set());
    const playerHasBases = player => player.has('bases');
    const playersWithoutBases = players.filterNot(playerHasBases);
    const newWorldState = playersWithoutBases.reduce(addBasesForPlayer, worldState);
    return { worldState: newWorldState };
}

function addBasesForPlayer (worldState, player) {
    const baseCandidates = worldState.getIn(baseCandidatesPath, List());
    const positionList = baseCandidates
        .slice(0, baseCandidates.size / 2)
        .map(candidate => !candidate);
    const isNoCandidateLeft = positionList.every(id);
    if (isNoCandidateLeft) {
        throw new Error('Maximum amount of players for this board exceeded.');
    }
    const firstBaseIndex = getMostIsolatedIndex(positionList);
    const baseIndexes = [
        firstBaseIndex,
        firstBaseIndex + baseCandidates.size / 2
    ];
    const playerBaseCoords = baseIndexes.map(::baseCandidates.get);
    const addBases = worldState => playerBaseCoords.reduce(partial(addBase, player), worldState);
    const removeUsedBaseCandidates = worldState => baseIndexes.reduce(removeBaseCandidate, worldState);
    const newWorldState = worldState
        .update(addBases)
        .update(removeUsedBaseCandidates);
    return newWorldState;
}

function removeBaseCandidate (worldState, baseIndex) {
    const baseCandidatePath = baseCandidatesPath.concat([baseIndex]);
    return worldState.setIn(baseCandidatePath, null);
}

function addBase (player, worldState, coords, index) {
    const playerName = player.get('name');
    const playerBaseId = `player-base-${playerName}-${index}`;
    const path = Map({
        ports: Set([coords.get('port')]),
        id: playerBaseId
    });
    return worldState
        .update(worldState => updateCardAtCoords(worldState, coords.toJS(), card => addPathToCard(card, path)))
        .update(worldState => saveBaseIdOnPlayer(worldState, playerName, playerBaseId));
}

function saveBaseIdOnPlayer (worldState, playerName, playerBaseId) {
    const newWorldState = worldState.update('players', Set(), players => {
        const player = players.find(player => player.get('name') === playerName);
        if (!player) {
            return players;
        }
        const updatedPlayer = player.update('bases', Set(), bases => bases.add(playerBaseId));
        return players.delete(player).add(updatedPlayer);
    });
    return newWorldState;
}

function addPathToCard (card, path) {
    return card.update('paths', Set(), paths => {
        return paths.add(path);
    });
}

//Get the index of the falsy value most isolated from truthy values in a cyclical list.
//Example: [false, true, false, false, true, false, false] => 6
function getMostIsolatedIndex (positions) {
    const firstTakenIndex = positions.findIndex(id);
    const areAllPositionsFree = (firstTakenIndex === -1);
    if (areAllPositionsFree) {
        return 0;
    }
    //Ensure we start on a free spot just after a taken position, so we're guaranteed to end on a taken position.
    const startIndex = firstTakenIndex + 1;
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

function* generateBaseCandidates (boardSize) {
    const startCoords = Map({ row: 0, col: 0 });
    const directionsGen = walkBorderDirections();
    const isCorner = coords => coords.every(coord => (coord === 0 || coord === (1 + boardSize)));
    const portsByDirection = {
        'right': [0, 1],
        'down': [6, 7],
        'left': [4, 5],
        'up': [2, 3]
    };
    yield* (function* nextBaseCandidate (coords, direction) {
        if (isCorner(coords)) {
            direction = directionsGen.next().value;
            if (!direction) {
                return null;
            }
        } else {
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
