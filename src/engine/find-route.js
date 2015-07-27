module.exports = findRoute;

const R = require('ramda');

function findRoute(pathId, worldState) {
    let paths = getQueryablePaths(worldState);
    let _getNeighbourPaths = R.flip(getNeighbourPaths)(paths);
    function findRouteRecusive(pathId, seenPathIds=[]) {
        //Check if we've already seen this path.
        if (R.contains(pathId, seenPathIds)) {
            return [];
        }
        let newSeenPathIds = R.append(pathId, seenPathIds);
        let newPathIds = _getNeighbourPaths(pathId);
        //Expand the new path ids one by one, keeping an up-to-date list of seen paths to ensure we don't go in loops.
        return R.reduce(
            (seen, _new) => R.concat(
                seen,
                findRouteRecusive(_new, seen)
            ),
            newSeenPathIds,
            newPathIds
        );
    }
    return findRouteRecusive(pathId);
}

function getNeighbourPaths(pathId, paths) {
    let coordsSet = paths.getCoordsById(pathId);
    return R.pipe(
        R.map(R.pipe(
            getNeighbourCoords,
            paths.getPathIdByCoords
        )),
        R.reject(R.isNil)
    )(coordsSet);
}

function getNeighbourCoords(coords) {
    let direction = Math.floor(coords.port / 2);
    let isEven = (number) => (number % 2) === 0;
    return R.evolve({
        row: [R.inc, R.identity, R.dec, R.identity][direction],
        col: [R.identity, R.inc, R.identity, R.dec][direction],
        port: R.pipe(
            R.ifElse(
                isEven,
                R.add(5),
                R.add(3)
            ),
            R.mathMod(R.__, 8)
        )
    }, coords);
}

function getQueryablePaths(worldState={}) {
    let { cards=[], board={} } = worldState;
    let { fields=[] } = board;
    let getCoordsById = (pathId) => {
        let { cardId, pathIndex } = pathId;
        let card = R.find(R.propEq(cardId, 'id'), cards);
        if (!card) {
            return [];
        }
        let field = R.find(R.propEq(card.field, 'id'), fields);
        if (!field) {
            return [];
        }
        let { row, col } = field;
        let { paths=[] } = getEquivalentNonRotatedCard(card);
        let { ports=[] } = paths[pathIndex];
        return ports.map((port) => ({ port, col, row }));
    };
    let getPathIdByCoords = (coords) => {
        let { row, col, port } = coords;
        let field = R.find(R.whereEq({ row, col }), fields);
        if (!field) {
            return null;
        }
        let card = R.find(R.propEq(field.id, 'field'), cards);
        if (!card) {
            return null;
        }
        let { paths=[] } = getEquivalentNonRotatedCard(card);
        let pathIndex = R.findIndex((path) => R.contains(port, path.ports || []), paths);
        return { cardId: card.id, pathIndex };
    };
    return { getCoordsById, getPathIdByCoords };
}

function getEquivalentNonRotatedCard(card) {
    let { rotation } = card;
    return R.evolve({
        paths: R.map(R.over(R.lensProp('ports'), R.map(
            (port) => R.mathMod(port - rotation / 45, 8)
        ))),
        rotation: R.always(0)
    })(card);
}


//Create a performant queryable interface for cards based on a world state.
function _getQueryablePaths(worldState) {
    let { cards, fields } = worldState;
    let fieldsById = R.fromPairs(fields.map((field) => [field.id, field]));
    let rotatePaths = (rotation) => R.map(
        R.over(R.lensProp('ports'), R.compose(
            R.mathMod(R.__, 8),
            R.add(rotation / 90))
        )
    );
    let addIndexedPaths = (card) => R.assoc(
        'indexedPorts',
        card.ports.reduce(
            (indexedPorts, port, index) => R.assoc(port, index, indexedPorts),
            {}
        ),
        card
    );
    let queryableCards = cards.map((card) => R.pipe(
        //Add row and col properties from containing field.
        R.merge(R.__, R.pick(['row', 'col'], fieldsById[card.id])),
        //Account for card rotation in paths' port numbers.
        R.over(R.lensProp('path'), R.pipe(
            rotatePaths(card.rotation),
            addIndexedPaths
        ))
    )(card));
    let queryableCardsById = R.fromPairs(queryableCards.map((card) => [card.id, card]));
    let queryableCardsByCoords = R.fromPairs(queryableCards.map((card) => [getCoordsKey(card), card]));
    return {
        getById: (cardId) => queryableCardsById[cardId],
        getByCoords: (coords) => queryableCardsByCoords[getCoordsKey(coords)]
    };
}
