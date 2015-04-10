const createGame = require('./logic/create-game');
const Kefir = require('kefir');

module.exports = function gameWorker(self) {
    let actions = Kefir.emitter();
    self.addEventListener('message', event => actions.emit(event.data));
    const gameState = createGame(actions);
    gameState.onValue(world => self.postMessage(world));
};
