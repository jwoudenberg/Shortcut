module.exports = createGame;

const R = require('ramda');
const Kefir = require('kefir');

const isAction = R.curry((action, event) => action === event.action);
function createGame(events) {
    const actions = [
        events.filter(isAction('create_game')).flatMap(createWorld)
    ];
    let stateChanges = Kefir.merge(actions);
    let state = stateChanges.scan((previous, modifier) => modifier(previous), {}).changes();
    return state;
}

/* Create world action */
const workerFunction = require('../util/worker-function');
const _createWorld = workerFunction(require('../logic-workers/create-world'));
function createWorld(options) {
    let world = _createWorld(options);
    return Kefir.fromPromise(world).map(world => () => world);
}
