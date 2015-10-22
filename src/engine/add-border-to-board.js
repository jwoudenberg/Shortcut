import { Set, Map } from 'immutable';
import { partial, isNil } from 'ramda';
import { getAll as getNeighbours } from './field-neighbours';

const isBorderField = field => field.get('neighbours').some(isNil);

export default function addBorder (uuidGenerator, worldState) {
    const board = worldState.get('board');
    if (!board) {
        throw new Error('World contains no board');
    }
    const fields = board.get('fields', Set());
    const borderCards = fields
        .map(partial(addNeighboursToField, worldState))
        .filter(isBorderField)
        .map(partial(createBorderCard, uuidGenerator));
    return worldState.update('cards', Set(), cards => cards.concat(borderCards));
}

function addNeighboursToField (worldState, field) {
    const neighbours = getNeighbours(field, worldState);
    return field.set('neighbours', neighbours);
}

const DIRECTION_PORT_MAP = {
    bottom: [0, 1],
    right: [2, 3],
    top: [4, 5],
    left: [6, 7]
};
const CORNER_PATHS = Set([ Set([1, 2]), Set([3, 4]), Set([5, 6]), Set([7, 0]) ]);
function createBorderCard (uuidGenerator, field) {
    const neighbours = field.get('neighbours');
    const neighbourDirections = Set.fromKeys(
        neighbours.filterNot(isNil)
    );
    const portsWithNeighbours = neighbourDirections.flatMap(direction => DIRECTION_PORT_MAP[direction]);
    const uuid = () => uuidGenerator.next().value;
    const paths = CORNER_PATHS
        .filter(cornerPorts => cornerPorts.isSubset(portsWithNeighbours))
        .map(ports => Map({ ports, id: uuid() }));
    return Map({
        id: uuid(),
        field: field.get('id'),
        paths,
        rotation: 0
    });
}
