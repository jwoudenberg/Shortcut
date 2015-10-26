import React from 'react';
import { Navbar, NavBrand, Nav, Grid, Button } from 'react-bootstrap';
import { Map } from 'immutable';
import parameters from '../../parameters';
import GameCreator from './game-creator';
import ErrorDisplay from './error-display';

export default function Page ({ events, game, world, errors }) {
    const currentPlayer = (world() || Map()).get('currentPlayer');
    const hasGameStarted = !!currentPlayer;
    const navBarContents = hasGameStarted
        ? <TurnBar events={events} player={currentPlayer} />
        : <GameCreator events={events} {...parameters.gameCreation} />;
    return (
        <div>
            <Navbar fluid={true}>
                <NavBrand><a href="#">Shortcut</a></NavBrand>
                {navBarContents}
            </Navbar>
            <Grid fluid={true}>
                <ErrorDisplay errors={errors} />
                {game}
            </Grid>
        </div>
    );
}

function TurnBar ({ events, player }) {
    return (
        <span className='pull-right'>
            <p className='navbar-text'>
                It's {player}'s turn!
            </p>
            <Button
                className='navbar-btn'
                bsStyle='primary'
                onClick={() => events({ type: 'end_turn' })}
                >
                End Turn
            </Button>
        </span>
    );
}
