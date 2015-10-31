import { stream, immediate } from 'flyd';
import filter from 'flyd/module/filter';
import { prop, containsWith, whereEq } from 'ramda';

const isEventOfType = typeToCheck => ({ type }) => type === typeToCheck;

export default function getRoutes (world, actions, events) {
    const latestRoutes = filter(isEventOfType('found_routes'), actions)
        .map(prop('routes'));
    const routes = immediate(stream([latestRoutes, world], (self, changed) => {
        if (changed[0] === world) {
            //The world changed, so our old routes are no longer valid.
            events({ type: 'find_routes' });
            return [];
        }
        return latestRoutes();
    }));
    const pickedPathId = filter(isEventOfType('show_route'), events)
        .map(prop('pathId'));
    const pickedRoutes = stream([routes, pickedPathId], () => {
        const pickedRoute = find(
            containsWith(
                whereEq,
                pickedPathId()
            ),
            routes()
        );
        return pickedRoute ? [pickedRoute] : [];
    });
    return pickedRoutes;
}
