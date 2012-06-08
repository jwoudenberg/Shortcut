/* --- MAKE ROUTE CACHED ---
    Takes parameters for a route, checks if a route with those parameters
    already exists. If so, returns that route. If not, creates a new route and
    returns that.
*/

define(['backbone', 'js/models/route'],
function (Backbone, Route) {
    //routes collection to be maintained through different function calls
    var routes = new (Backbone.Collection.extend({ model: Route }))();

    //if routes are destroyed, remove them from the collection
    routes.on('destroy', function (route) {
        this.remove(route);
    }, routes);

    return function (protoRoute) {
        var route;

        //search for route in routes collection
        route = routes.where(protoRoute);
        if (route.length === 0) {
            //create new route
            route = new Route(protoRoute);
            routes.add(route);
        }
        else {
            //pick the first route in the array (if all is well the only one)
            route = route[0];
        }

        return route;
    };
});