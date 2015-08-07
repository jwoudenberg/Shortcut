import * as R from 'ramda';
import { Map, Set, List } from 'immutable';

let getQueryablePathsMemoized = memoizeLast(getQueryablePaths);

/* All the following functions take and return immutable.js data structures. */
export function findRoute(mutablePathId, worldState) {
    const pathId = Map(mutablePathId);
    const paths = getQueryablePathsMemoized(worldState);
    const _getNeighbourPaths = R.flip(getNeighbourPaths)(paths);
    function findRouteRecusive(pathId, seenPathIds=Set()) {
        //Check if we've already seen this path.
        if (seenPathIds.has(pathId)) {
            return Set();
        }
        //Expand the new path ids one by one, keeping an up-to-date list of seen paths to ensure we don't go in loops.
        return _getNeighbourPaths(pathId).reduce(
            (seen, _new) => seen.concat(findRouteRecusive(_new, seen)),
            seenPathIds.add(pathId)
        );
    }
    return findRouteRecusive(pathId);
}

export function findAllRoutes(worldState) {
    const pathSet = getQueryablePathsMemoized(worldState).get();
    function findRoutesLeft(pathsLeft) {
        if (pathsLeft.isEmpty()) {
            return Set();
        }
        const firstRoute = findRoute(pathsLeft.first(), worldState);
        const otherRoutes = findRoutesLeft(pathsLeft.subtract(firstRoute));
        return otherRoutes.add(firstRoute);
    }
    return findRoutesLeft(pathSet);
}

function getNeighbourPaths(pathId, paths) {
    return paths.getCoordsById(pathId)
        .map(R.pipe(
            getNeighbourCoords,
            paths.getIdByCoords
        ))
        .filterNot(R.isNil);
}

function getNeighbourCoords(coords) {
    const direction = Math.floor(coords.get('port') / 2);
    const isEven = (number) => (number % 2) === 0;
    return coords
        .update('row', [R.inc, R.identity, R.dec, R.identity][direction])
        .update('col', [R.identity, R.inc, R.identity, R.dec][direction])
        .update('port', R.pipe(
            R.ifElse(
                isEven,
                R.add(5),
                R.add(3)
            ),
            R.mathMod(R.__, 8)
        ));
}

function getQueryablePaths(worldState) {
    const fields = worldState.getIn(['board', 'fields'], List());
    const coordsByFieldId = new Map(
        fields.map(field => [field.get('id'), { row: field.get('row'), col: field.get('col') }])
    );
    const cards = worldState.get('cards', List()).map(getEquivalentNonRotatedCard);
    const coordsByPathId = Map(
        cards.flatMap(
            card =>  card.get('paths', List()).map(
                (path, pathIndex) =>  {
                    const ports = path.get('ports', List());
                    const cardId = card.get('id');
                    const { row, col } = coordsByFieldId.get(card.get('field')) || {};
                    return [
                        Map({ pathIndex, cardId }),
                        ports.map(port => Map({ port, row, col }))
                    ];
                }
            )
        )
    );
    const pathIdByCoords = coordsByPathId.flatMap(
        (coords, pathId) => Map(
            coords.map(coord => [coord, pathId])
        )
    );
    return {
        getCoordsById: ::coordsByPathId.get,
        getIdByCoords: ::pathIdByCoords.get,
        get: () => pathIdByCoords.toSet()
    };
}

function getEquivalentNonRotatedCard(card) {
    const rotation = card.get('rotation');
    return card
        .set('rotation', 0)
        .update('paths', List(), (paths) => paths.map(
            (path) => path.update('ports', List(), (ports) => ports.map(
                (port) => R.mathMod(port - rotation / 45, 8)
            ))
        ));
}

function memoizeLast(fn) {
    let lastArgs = null;
    let lastResult = null;
    return (..._args) => {
        const args = List(_args);
        if (!args.equals(lastArgs)) {
            lastArgs = args;
            lastResult = fn(...args.toArray());
        }
        return lastResult;
    }
}
