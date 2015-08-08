import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';
import React from 'react';
import flyd from 'flyd';
import { Navbar, Nav, Grid } from 'react-bootstrap';
import { createGame } from './game';
import { GameCreator } from './page';
import parameters from '../parameters';

export * from './base';

export function renderPage(world, actions) {
    /* Render the game itself. */
    const gameStream = createGame(actions, world);
    flyd.on(renderGame, gameStream);
}

function renderGame(game) {
    //TODO: make the Navbar content depending on game context.
    React.render(
        <div>
            <Navbar brand="Shortcut" fluid={true}>
                <Nav>
                    <GameCreator {...parameters.gameCreation} />
                </Nav>
            </Navbar>
            <Grid fluid={true}>
                {game}
            </Grid>,
        </div>,
        document.body
    );
}
