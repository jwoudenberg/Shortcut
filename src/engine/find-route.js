import * as R from 'ramda';
import { fromJS, Map, Set, List } from 'immutable';

export default function findRoute(mutablePathId, worldState) {
    let pathId = Map(mutablePathId);
    let paths = getQueryablePaths(worldState);
    let _getNeighbourPaths = R.flip(getNeighbourPaths)(paths);
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
    return findRouteRecusive(pathId).toJS();
}

function getNeighbourPaths(pathId, paths) {
    return paths.getCoordsByPathId(pathId)
        .map(R.pipe(
            getNeighbourCoords,
            paths.getPathIdByCoords
        ))
        .filterNot(R.isNil);
}

function getNeighbourCoords(coords) {
    let direction = Math.floor(coords.get('port') / 2);
    let isEven = (number) => (number % 2) === 0;
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

function getQueryablePaths({ board: { fields = [] } = {}, cards = [] } = {}) {
    let coordsByFieldId = new Map(
        fields.map(({ id, row, col }) => [id, { row, col }])
    );
    let _cards = fromJS(cards).map(getEquivalentNonRotatedCard);
    let coordsByPathId = Map(
        _cards.flatMap(
            card =>  card.get('paths', List()).map(
                (path, pathIndex) =>  {
                    let ports = path.get('ports', List());
                    let cardId = card.get('id');
                    let { row, col } = coordsByFieldId.get(card.get('field'));
                    return [
                        Map({ pathIndex, cardId }),
                        ports.map(port => Map({ port, row, col }))
                    ];
                }
            )
        )
    );
    let pathIdByCoords = coordsByPathId.flatMap(
        (coords, pathId) => Map(
            coords.map(coord => [coord, pathId])
        )
    );
    return {
        getCoordsByPathId: ::coordsByPathId.get,
        getPathIdByCoords: ::pathIdByCoords.get
    };
}

function getEquivalentNonRotatedCard(card) {
    let rotation = card.get('rotation');
    return card
        .set('rotation', 0)
        .update('paths', List(), (paths) => paths.map(
            (path) => path.update('ports', List(), (ports) => ports.map(
                (port) => R.mathMod(port - rotation / 45, 8)
            ))
        ));
}
