exports.createGameView = createGameView;
exports.uiEvents = require('flyd').stream();

const React = require('react');
const Game = require('./components').Game;
const GameCreator = require('./page').GameCreator;

function createGameView(world, parameters) {
    /* Render the game itself. */
    React.render(
        <div className="container-fluid"><Game world={world} /></div>,
        document.getElementById('app-content')
    );

    /* Render surrounding UI. */
    React.render(
        <GameCreator {...parameters.gameCreation} />,
        document.getElementById('app-navbar')
    );
}
