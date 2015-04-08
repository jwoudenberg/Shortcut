const R = require('ramda');
const React = require('react');
const parameters = require('./parameters');
const uiEventStream = require('./view/ui-event-stream');
const Game = require('./view/components').Game;
const GameCreator = require('./view/page').GameCreator;
const addBoardToWorld = require('./logic/add-board-to-world');
const addBorder = require('./logic/add-border-to-board');

React.render(
    <GameCreator {...parameters.gameCreation} />,
    document.getElementById('app-navbar')
);

let world = initWorld({ boardSize: parameters.gameCreation.boardSize.default });
renderWorld(world);


uiEventStream.onValue(R.pipe(initWorld, renderWorld));

function initWorld(options) {
    let { boardSize } = options;
    let boardSizeWithBorders = boardSize + 2;
    let world = addBoardToWorld({ width: boardSizeWithBorders, height: boardSizeWithBorders }, { cards: [] });
    world = addBorder(world);
    return world;
}

function renderWorld(world) {
    React.render(
        <div className="container-fluid"><Game world={world} /></div>,
        document.getElementById('app-content')
    );
}
