const createGame = require('./logic/create-game');
const flyd = require('flyd');

module.exports = function gameWorker(self) {
    let actions = flyd.stream();
    self.addEventListener('message', event => actions(event.data));
    const world = createGame(actions);
    flyd.on(world => self.postMessage(world), world);
};
