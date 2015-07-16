/* Exports the same interface as ../engine does, to allow easy switching between engine running in worker or not. */
module.exports = { createGame };

const flyd = require('flyd');
const work = require('webworkify');
const engineWorker = work(require('./engine-wrapper'));

function createGame(uiEvents) {
    const world = flyd.stream({});
    //Run the engine in a webworker.
    flyd.on(event => engineWorker.postMessage(event), uiEvents);
    engineWorker.addEventListener('message', event => world(event.data));
    return world;
}
