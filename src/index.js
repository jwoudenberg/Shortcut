const R = require('ramda');
const React = require('react');
const parameters = require('./parameters');
const uiEventStream = require('./view/ui-event-stream');
const Game = require('./view/components').Game;
const GameCreator = require('./view/page').GameCreator;

const workerFunction = require('./util/worker-function');
const createWorld = workerFunction(require('./logic-workers/create-world'));

React.render(
    <GameCreator {...parameters.gameCreation} />,
    document.getElementById('app-navbar')
);

createWorld({ boardSize: parameters.gameCreation.boardSize.default })
    .then(renderWorld);

uiEventStream.onValue(R.pipeP(createWorld, renderWorld));

function renderWorld(world) {
    React.render(
        <div className="container-fluid"><Game world={world} /></div>,
        document.getElementById('app-content')
    );
}
