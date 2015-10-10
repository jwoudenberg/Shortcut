import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';
import React from 'react';
import { render } from 'react-dom';
import 'react-dom';
import { fromJS } from 'immutable';
import { stream, on } from 'flyd';
import { partial, contains, assoc } from 'ramda';
import { Navbar, NavBrand, Nav, Grid } from 'react-bootstrap';
import { createGame } from './game';
import { GameCreator } from './page';
import parameters from '../parameters';

const MOVE_TYPES = ['create_game', 'take_card', 'rotate_card', 'move_card', 'add_player'];

export function createView (world, moves) {
    const events = stream();
    const plainWorld = world.map(immutableWorldState => immutableWorldState.toJS());
    const gameStream = createGame(moves, plainWorld, events);
    on(partial(renderGame, events), gameStream);
    const userMoves = stream([events], _userMoves => {
        const event = events();
        if (contains(event.type, MOVE_TYPES)) {
            const previousMoveHash = moves() && moves().hash;
            const move = assoc('previousMoveHash', previousMoveHash, event);
            _userMoves(move);
        }
    });
    return userMoves.map(fromJS);
}

//React prefers not te be rendered directly into the body.
const appDiv = document.createElement('div');
document.body.appendChild(appDiv);

function renderGame (events, game) {
    //TODO: make the Navbar content depending on game context.
    render(
        <div>
            <Navbar fluid={true}>
                <NavBrand><a href="#">Shortcut</a></NavBrand>
                <Nav>
                    <GameCreator events={events} {...parameters.gameCreation} />
                </Nav>
            </Navbar>
            <Grid fluid={true}>
                {game}
            </Grid>
        </div>,
        appDiv
    );
}
