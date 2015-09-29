/* This is ran inside the webworker. It creates the game and passes messages to and from it. */
import { createGame } from '../engine';
import flyd from 'flyd';

export default function gameWorker (self) {
    //Receive ui events.
    let uiEvents = flyd.stream();
    self.addEventListener('message', event => uiEvents(event.data));

    //Send game events.
    const { world, moves } = createGame(uiEvents);
    flyd.on(worldState => self.postMessage({ type: 'world', value: worldState }), world);
    flyd.on(move => self.postMessage({ type: 'moves', value: move }), moves);
}
