/* Exports the same interface as ../engine does, to allow easy switching between engine running in worker or not. */
module.exports = { createGame };

const flyd = require('flyd');
const work = require('webworkify');
const engineWorker = work(require('./engine-wrapper'));

function createGame(uiEvents) {
    //Send ui events.
    flyd.on(event => engineWorker.postMessage(event), uiEvents);

    //Receive game events.
    let world = flyd.stream({});
    let actions = flyd.stream();
    let gameStreams = { world, actions };
    engineWorker.addEventListener('message', function pushToRightStream(event) {
        let { type, value } = event.data;
        gameStreams[type](value);
    });

    return gameStreams;
}
