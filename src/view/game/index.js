import React from 'react';
import Lift from 'flyd-lift-react';
import getSelectedCardId from './get-selected-card-id';
import getRoutes from './get-routes';
import './style.css';
import Game from './game';

export default ({ actions, world, events }) => {
    const selectedCardId = getSelectedCardId(world, events);
    const routes = getRoutes(world, actions, events);
    //TODO: make this size depend on the available screen area.
    const fieldSize = 100;
    //React components stay solely responsible for rendering state. All other logic stays outside.
    const LiftedGame = Lift(Game);
    return <LiftedGame
        fieldSize={fieldSize}
        worldState={world}
        selectedCardId={selectedCardId}
        routes={routes}
        events={e => events(e)}
    />;
};
