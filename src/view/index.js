import React from 'react';
import flyd from 'flyd';
import { createGame } from './game';
import { GameCreator } from './page';

export * from './base';

export function renderPage(world, actions, parameters) {
    /* Render the game itself. */
    const gameStream = createGame(actions, world);
    flyd.on(renderGame, gameStream);

    /* Render surrounding UI. */
    React.render(
        <GameCreator {...parameters.gameCreation} />,
        document.getElementById('app-navbar')
    );
}

function renderGame(game) {
    return React.render(
        <div className="container-fluid">{game}</div>,
            document.getElementById('app-content')
    );
}
