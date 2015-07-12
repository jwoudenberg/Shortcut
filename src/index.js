const React = require('react');
const parameters = require('./parameters');
const uiEventStream = require('./view/ui-event-stream');
const Game = require('./view/components').Game;
const GameCreator = require('./view/page').GameCreator;

// //Run the engine in a webworker.
// const work = require('webworkify');
// const engineWorker = work(require('./game-worker'));
// uiEventStream.onValue(event => engineWorker.postMessage(event));
// engineWorker.addEventListener('message', event => renderWorld(event.data));

//DEBUG: Don't run the engine in a web worker
const engine = require('./logic/create-game')(uiEventStream);
engine.onValue(renderWorld);

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
