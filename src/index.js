require('babelify/polyfill');
const parameters = require('./parameters');
const { createGame } = require('./engine');
const { renderPage, uiEvents } = require('./view');
const { on } = require('flyd');

const { actions, world } = createGame(uiEvents);
renderPage(world, actions, parameters);

//TODO: put this behind a production flag.
//Logging:
on(action => console.log('Action: ', action), actions);
on(event => console.log('uiEvent: ', event), uiEvents);
on(worldState => console.log('worldState: ', worldState), world);
