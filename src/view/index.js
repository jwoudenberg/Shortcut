import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';
import React from 'react';
import { stream, on } from 'flyd';
import { partial, contains, assoc } from 'ramda';
import { Navbar, Nav, Grid } from 'react-bootstrap';
import { createGame } from './game';
import { GameCreator } from './page';
import parameters from '../parameters';

const MOVE_TYPES = ['create_game', 'take_card', 'rotate_card', 'move_card'];

export function createView (world, moves) {
    /* Render the game itself. */
    const events = stream();
    const gameStream = createGame(moves, world, events);
    on(partial(renderGame, events), gameStream);
    const userMoves = stream([events], _userMoves => {
        const event = events();
        if (contains(event.type, MOVE_TYPES)) {
            const previousMoveHash = moves() && moves().hash;
            const move = assoc('previousMoveHash', previousMoveHash, event);
            _userMoves(move);
        }
    });
    return userMoves;
}

function renderGame (events, game) {
    //TODO: make the Navbar content depending on game context.
    React.render(
        <div>
            <Navbar brand="Shortcut" fluid={true}>
                <Nav>
                    <GameCreator events={events} {...parameters.gameCreation} />
                </Nav>
            </Navbar>
            <Grid fluid={true}>
                {game}
            </Grid>,
        </div>,
        document.body
    );
}
