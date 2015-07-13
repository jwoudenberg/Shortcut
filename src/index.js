const React = require('react');
const flyd = require('flyd');
const parameters = require('./parameters');
const uiEvents = require('./view/ui-event-stream');
const Game = require('./view/components').Game;
const GameCreator = require('./view/page').GameCreator;

// //Run the engine in a webworker.
// const work = require('webworkify');
// const engineWorker = work(require('./game-worker'));
// flyd.on(event => engineWorker.postMessage(event), uiEvents);
// engineWorker.addEventListener('message', event => renderWorld(event.data));

//DEBUG: Don't run the engine in a web worker
const world = require('./logic/create-game')(uiEvents);
flyd.on(renderWorld, world);

function renderWorld(world) {
    React.render(
        <div className="container-fluid"><Game world={world} /></div>,
        document.getElementById('app-content')
    );
}

/* Render surrounding UI */
React.render(
    <GameCreator {...parameters.gameCreation} />,
    document.getElementById('app-navbar')
);
