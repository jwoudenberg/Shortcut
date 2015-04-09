const React = require('react');
const parameters = require('./parameters');
const uiEventStream = require('./view/ui-event-stream');
const Game = require('./view/components').Game;
const GameCreator = require('./view/page').GameCreator;
const createGame = require('./logic/create-game');

/* Render game */
const gameEngine = createGame(uiEventStream);
gameEngine.onValue(renderWorld);
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
