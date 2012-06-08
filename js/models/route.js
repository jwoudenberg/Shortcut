/* --- ROUTE ---

    Contains a collection of paths that consist the route. On creation it is
    provided with a beginning path and optionally a direction and goal-path.
    The route then finds all paths connected to the beginning, possibly
    including multiple branches.
    
    If a goal path has been provided, the goalReached variable will tell whether
    that goal was reached. If so, only the paths in the (sub)route(s) ending in
    that goal will be saved.
    
    The route listens to events from cards the paths cross, as well as empty
    field(s) at the end(s) of the (sub)route(s).
*/
define(['backbone', 'js/collections/paths', 'js/collections/cards',
    'js/collections/fields'],
function (Backbone, Paths, Cards, Fields) {

    return Backbone.Model.extend({

        //will come to contain a collection of...
        paths: undefined,       //...paths in the route
        goalPaths: undefined,   //...paths leading to the goal (if provided)
        cards: undefined,       //...cards crossed in the route
        emptyFields: undefined, //...empty field(s) at the end(s) of the route

        defaults: {
            //mandatory
            begin: undefined,
            //optional
            direction: undefined,
            goal: undefined,
            //set by model
            goalReached: false
        },

        initialize: function () {
            var path = this.get('begin'),
                card = path.get('card'),
                field = card.get('holder'),
                board = field.get('board'),
                port, place, result;

            //initialize paths collection
            this.paths = new Paths();
            this.goalPaths = new Paths();
            this.emptyFields = new Fields();
            this.cards = new Cards();

            //check if provided card is on a board (and not a deck)
            if (board === undefined) {
                throw new Error ("Route: can only build a route from a card on a board.");
            }

            //if no direction port was provided, pick the end port of the path
            port = this.get('direction');
            if (port === undefined) {
                //call to getSoftPort() takes rotation of card into account
                port = card.getSoftPort(path.get('end'));
            }

            //the place object contains all information on one location
            place = {
                field: field,
                card: card,
                path: path,
                port: port
            };

            //build the route here
            result = this.doStep(place);
            if (this.get('goalReached') === true) {
                //the goal was reached, only the path to the goal matters now
                this.paths = this.goalPaths;
            }
            //goalPaths roal is played
            this.goalPaths.reset();

            //add all the cards the route runs through to the cards collection
            this.paths.forEach(function (path) {
                this.cards.add(path.get('card'));
            }, this);

            //listen for path, card and field changes that would destroy path
            this.paths.on('change destroy', this.destroy, this);
            this.cards.on('change:holder change:rotation destroy',
                this.destroy, this);
            this.emptyFields.on('change:card', this.destroy, this);

            return result;
        },

        saveStep: function (place) {
            //takes a place object and saves the path contained in collection
            //does not account of possibily of walking over a path in two
            //directions (might be essential in future game version).
            var result;

            //check if this place has already been saved.
            if (this.paths.getByCid(place.path.cid) === undefined) {
                //add this path the the route-collection
                this.paths.add(place.path);
                result = true;
            }
            else {
                //we have walked over this path before
                result = false;
            }

            return result;
        },

        doStep: function (place) {
            /* OVERVIEW
            The doStep() function takes a step (described below) then calls
            itself recursively for the next step until it reaches an end.

            TAKING A STEP
            0. Save the provided path
            1. Check if the provided path is the goal
            2. Follow the provided path from the provided port to its other port
            3. Find the field adjacent to the path-end found in step 2
            4. Find the card in that field
            5. Find the paths that connect to the port found in step 2
            6. For each path found, call doStep() again
               - possibly many recursive calls -
            7. On the way back, check if goal was reached. If so; save path
               again in seperate collection of paths that lead towards the goal
            */

            var nextField, nextCard, nextPort,
                nextPaths, result, i, branch;

            //[ 0 ] attempt to save path
            if (!this.saveStep(place)) {

                //we're walking in circles
                result = 'made a circle';

            }
            //[ 1 ] check if path is goal
            else if (this.get('goal') !== undefined &&
                    place.path.cid === this.get('goal').cid) {

                //we've found our goal
                this.set('goalReached', true);
                result = true;

            }
            //[ 2 ] follow the path
            else if ((nextPort = place.card.follow(place.path, place.port)) === 'unconnected') {
                //This path is a dead-end. End of route.
                result = 'reached a dead-end path';
            }
            //[ 3 ] get next field.
            else if ((nextField = place.field.step(this.constructor.cardLookup[nextPort])) === undefined){

                result = 'reached border of the board';

            }    
            //[ 4 ] get card in field. if none, listen for cards being placed in field
            else if ((nextCard = nextField.get('card')) === undefined) {

                //the field doesn't exist, we have tried to walk off the board
                this.emptyFields.add(nextField); //save field
                result = 'reached empty field';
            
            }
            else {                
                //[ 5 ] translate port, then get paths.
                nextPort = this.constructor.portLookup[nextPort];
                nextPaths = nextCard.getPaths(nextPort);

                if (nextPaths.length === 0) {
                    //no path connected to this port
                    result = 'next card has no path connected to this port';
                }
                //[ 6 ] prepare next step(s). The route can branch of
                else {
                    for (i = nextPaths.length; i--;) {
                        //call doStep() recursively to make next step
                        branch = this.doStep({
                            //the place-object for the next step
                            port:   nextPort,
                            path:   nextPaths[i],
                            card:   nextCard,
                            field:  nextField
                        });

                        //if one branche finds the goal, that result counts
                        if (result !== true) {
                            result = branch;
                        }
                    }
                }
            }

            //from this point on we're travelling back the recursion tree
            //[ 7 ] check if goal was found   
            if (this.get('goal') !== undefined && result === true) {
                //moving back from the goal, add this path to the goalPaths
                this.goalPaths.add(place.path);
            }

            //return result succes/failure to reach goal to previous step
            return result;
        },

        destroy: function () {
            //call inherited destroy function
            Backbone.Model.prototype.destroy.call(this);

            //remove all event handlers
            this.paths.off(null, this.remove, this);
            this.cards.off(null, this.remove, this);
            this.emptyFields.off(null, this.remove, this);

            //empty collections
            this.paths.reset();
            this.cards.reset();
            this.emptyFields.reset();
        }

    }, {
        //CLASS PROPERTIES (accessible by all instances of route)
        //match ports to directions (for instance, ports 0,1 move downwards)
        cardLookup: ['down', 'down', 'right', 'right', 'up', 'up', 'left', 'left'],

        //match exit and entrance ports (for instance, port 0 leads to port 5
        //  on the adjacent card)
        portLookup: [5, 4, 7, 6, 1, 0, 3, 2]
    });
});