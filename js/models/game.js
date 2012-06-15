/* --- GAME ---

    Contains collections of containing all game-related model-types and methods
    to start a game and go to the next turn.

    This model needs to be extended to a gametype to be usefull. This gametype
    will add rule-logic by overwriting some of the game models functions.
*/

define(['underscore', 'backbone', 'js/models/board', 'js/models/deck',
    'js/models/card', 'js/models/player', 'js/models/turn', 'js/models/route'],
function (_, Backbone, Board, Deck, Card, Player, Turn, Route) {
    return Backbone.Model.extend({

        //defined by initialize()
        boards: undefined,
        decks: undefined,
        cards: undefined,
        players: undefined,
        turns: undefined,
        routes: undefined,

        initialize: function (attrs, options) {
            //incorporate gametype
            _.extend(this, options.type);

            //create collections
            this.boards = new (Backbone.Collection.extend({ model: Board }))();
            this.decks =  new (Backbone.Collection.extend({ model: Deck }))();
            this.cards =  new (Backbone.Collection.extend({ model: Card }))();
            this.players =new (Backbone.Collection.extend({ model: Player }))();
            this.turns =  new (Backbone.Collection.extend({ model: Turn }))();
            this.routes = new (Backbone.Collection.extend({ model: Route }))();
        },

        end: function () {
            //call function for gametype
            this.onEnd();

            //stop listening
            this.boards.off (null, null, this);
            this.decks.off (null, null, this);
            this.cards.off (null, null, this);
            this.players.off (null, null, this);

            //end elements
            var endItem = function (item) { item.end(); };
            this.boards.forEach(endItem, this);
            this.decks.forEach(endItem, this);
            this.cards.forEach(endItem, this);
            this.players.forEach(endItem, this);
            this.turns.forEach(endItem, this);

            //delete references
            delete this.boards;
            delete this.decks;
            delete this.cards;
            delete this.players;
            delete this.turns;
        },

        start: function (setup) {
            var result = this.validateStart(setup);
            if (result === true) {
                this.setup(setup);

                //listen to collections
                this.boards.on('change', function (model, options) {
                    this._respond('board', model, options);
                }, this);
                this.boards.on('fields', function (model, options) {
                    this._respond('holder', model, options);
                }, this);
                this.decks.on('change', function (model, options) {
                    this._respond('holder', model, options);
                }, this);
                this.cards.on('change', function (model, options) {
                    this._respond('card', model, options);
                }, this);
                this.players.on('change', function (model, options) {
                    this._respond('player', model, options);
                }, this);

                this.nextTurn(); //first turn!
            }
            return result;
        },

        nextTurn: function () {
            //add a new turn object (these don't contain any info at this time)
            var turns = this.turns,
                players = this.players,
                lastTurn = this.turns.last(),
                validation, player, index, winners;

            //who's turn is it?
            if (!lastTurn) {
                //first turn
                player = players.first();
            }
            else {
                //check if the game has already finished
                if (lastTurn.get('lastTurn')) return 'Game has ended.';

                //check if new Turn is allowed
                validation = this.validateTurn(lastTurn);
                if (validation !== true) return validation;

                //gametype can wrap-up and possibly finish the game
                winners = this.onTurnEnd(lastTurn);
                if (winners) {
                    this.finish(winners);
                    //this is the last turn
                    lastTurn.set({lastTurn: true});
                    return true;
                }

                //get the next player
                index = players.indexOf(lastTurn.get('player'));
                player = players.at((index + 1) % players.length);
            }
            turns.add({ player: player });
            this.onTurnStart(turns.last());
            return true;
        },

        finish: function (winners) {
            var i;

            //freeze the game
            this.cards.forEach(function (card) {
                card.set({
                    moveLock:  true,
                    rotateLock:true
                });
            }, this);
            this.decks.forEach(function (deck) {
                deck.set({ popLock:  true });
            }, this);

            // if everybody won, nobody won
            if (winners.length === this.players.length) winners = [];

            for (i = winners.length-1; i >= 0; i--) {
                winners[i].set('winner', true);
            }

            this.trigger('finish', winners);
        },

        newBoard: function (options) {
            var board = new Board({
                size:   options.size
            }, {
                game:   this
            });
            this.boards.add(board);
            return board;
        },

        newCard: function (options) {
            var card = new Card({
                holder:     options.holder,
                rotation:   options.rotation,
                rotateLock: options.rotateLock,
                moveLock:   options.moveLock
            }, {
                game:       this,
                paths:      options.paths
            });
            this.cards.add(card);
            return card;
        },

        newDeck: function (options) {
            var deck = new Deck({
                popLock:    options.popLock,
            }, {
                game:       this
            });
            this.decks.add(deck);
            return deck;
        },

        newPlayer: function (options) {
            var player = new Player({
                name:       options.name
            }, {
                game:       this
            });
            this.players.add(player);
            return player;
        },

        newRoute: function (options) {
            var routes = this.routes,
                route;

            //search for route in routes collection
            route = routes.find(function (route) {
                //begin and goal models must be the same
                var goal1 = route.get('goal') && route.get('goal').cid,
                    goal2 = options.goal && options.goal.cid;
                if (goal1 === goal2 && route.get('begin').cid === options.begin.cid) {
                    return true;
                }
            });
            if (route === undefined) {
                //create new route
                route = new Route(options);
                routes.add(route);
            }

            //trigger event
            this.trigger('route', route);
            return route;
        },

        _respond: function (type, model, options) {
            if (!options.noLog) {
                var changes, response;

                changes = model.changedAttributes();

                //loop through all the changes for this model
                for (var attr in changes) {
                    //get a response from the gametype
                    response = this.onChange(type, attr, model);
                    //log the event and the response in the last turn
                    this.turns.last().log(model, attr, response);
                }
            }
        },

        // RULE FUNCTIONS - overwrite these in a gametype.
        validateStart: function (setup) { return true; },
        validateTurn: function (turn) { return true; },
        setup: function (setup) {},
        onEnd: function () {},
        onChange: function (type, attr, model) {},
        onTurnStart: function (turn) {},
        onTurnEnd: function (turn) {}

    });
});