/* This is ran inside the webworker. It creates the game and passes messages to and from it. */
module.exports = gameWorker;

const {createGame} = require('../engine');
const flyd = require('flyd');

function gameWorker(self) {
    //Receive ui events.
    let uiEvents = flyd.stream();
    self.addEventListener('message', event => uiEvents(event.data));

    //Send game events.
    const { world, actions } = createGame(uiEvents);
    flyd.on(worldState => self.postMessage({ type: 'world', value: worldState }), world);
    flyd.on(action => self.postMessage({ type: 'actions', value: action }), actions);
}
