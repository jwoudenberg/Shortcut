import { partial } from 'ramda';

export default function setupRules (rules) {

    function apply (worldState, move) {
        return rules.reduce(
            partial(ruleReducer, move),
            { worldState, errors: [] }
        );
    }

    function ruleReducer (move, { worldState, errors }, rule) {
        const { worldState: newWorldState = worldState, error } = rule(move, worldState) || {};
        if (error) {
            errors.push(error);
        }
        return { worldState: newWorldState, errors };
    }

    return { apply };
}
