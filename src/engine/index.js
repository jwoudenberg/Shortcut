import { is } from 'immutable';
import { complement, isNil } from 'ramda';
import { stream, on } from 'flyd';
import { dropRepeatsWith } from 'flyd/module/droprepeats';
import filter from 'flyd/module/filter';
import { create as createTurnBasedGame } from './turn-based-game-engine';
import { create as createGameMaster } from './game-master';
import rules from './rules';

export function createGame (moves) {
    const { makeMove, getWorldState, onMove } = createTurnBasedGame(rules);
    const errors = applyMoves(makeMove, moves);
    const acceptedMoves = getAcceptedMoves(onMove);
    const world = getWorld(getWorldState, acceptedMoves);
    on(moves, createGameMaster(acceptedMoves));
    return {
        errors,
        world,
        moves: acceptedMoves.map(move => move.set('hash', move.hashCode()).toJS())
    };
}

function getAcceptedMoves (onMove) {
    const acceptedMoves = stream();
    onMove(acceptedMoves);
    return acceptedMoves;
}

function applyMoves (makeMove, moves) {
    const errors = stream([moves], async _errors => {
        const { error } = await makeMove(moves());
        if (error) {
            _errors(error);
        }
    });
    return errors;
}

function getWorld (getWorldState, moves) {
    const world = stream([moves], () => {
        return getWorldState(moves().hashCode())
            .catch(function handleError (error) {
                //TODO: clean this up.
                console.error(error);
            });
    });
    const nonEmptyWorld = filter(complement(isNil), world);
    const dedupedWorld = dropRepeatsWith(is, nonEmptyWorld);
    return dedupedWorld;
}
