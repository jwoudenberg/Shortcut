import React from 'react';
import { Navbar, NavBrand, Grid, Button } from 'react-bootstrap';
import { Map } from 'immutable';
import Lift from 'flyd-lift-react';
import parameters from '../../parameters';
import GameCreator from './game-creator';
import Game from '../game';
import ErrorDisplay from './error-display';

export default function Page ({ events, world, errors, moves }) {
    const LiftedNavigation = Lift(Navigation);
    return (
        <div>
            <LiftedNavigation
                world={world}
                events={e => events(e)}
            />
            <Grid fluid={true}>
                <ErrorDisplay errors={errors} />
                <Game
                    actions={moves}
                    world={world}
                    events={events}
                />
            </Grid>
        </div>
    );
}

function Navigation ({ world, events }) {
    const currentPlayer = (world || Map()).get('currentPlayer');
    const hasGameStarted = !!currentPlayer;
    const navBarContents = hasGameStarted
        ? <TurnBar events={events} player={currentPlayer} />
        : <GameCreator events={events} {...parameters.gameCreation} />;
    return (
        <Navbar fluid={true}>
            <NavBrand><a href="#">Shortcut</a></NavBrand>
            {navBarContents}
        </Navbar>
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
