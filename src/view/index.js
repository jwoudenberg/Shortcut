import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';
import { render } from 'react-dom';
import 'react-dom';
import { fromJS } from 'immutable';
import { stream, on } from 'flyd';
import { partial, contains, assoc } from 'ramda';
import { createGame } from './game';
import Page from './page';

const MOVE_TYPES = ['create_game', 'take_card', 'rotate_card', 'move_card', 'add_player', 'start_game', 'end_turn'];

export function createView (world, moves, errors) {
    const events = stream();
    const gameStream = createGame(moves, world, events);
    on(partial(renderGame, events, world, errors), gameStream);
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

function renderGame (events, world, errors, game) {
    render(
        Page({ events, game, world, errors }),
        appDiv
    );
}
