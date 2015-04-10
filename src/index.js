const React = require('react');
const parameters = require('./parameters');
const uiEventStream = require('./view/ui-event-stream');
const Game = require('./view/components').Game;
const GameCreator = require('./view/page').GameCreator;
const work = require('webworkify');
const engineWorker = work(require('./game-worker'));

uiEventStream.onValue(event => engineWorker.postMessage(event));
engineWorker.addEventListener('message', event => renderWorld(event.data));

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
