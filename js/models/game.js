// --- GAME ---

/*
Contains collections of containing all game-related model-types and methods
to start a game and go to the next turn.

This model needs to be extended to a gametype to be usefull. This gametype model
will add rule-logic by overwriting some of the game models functions.
*/

define(['underscore', 'backbone', 'js/models/board', 'js/models/deck',
    'js/models/card', 'js/models/player', 'js/models/turn'],
function (_, Backbone, Board, Deck, Card, Player, Turn) {
    return Backbone.Model.extend({

        //defined by initialize()
        boards: undefined,
        decks: undefined,
        cards: undefined,
        players: undefined,
        turns: undefined,

        initialize: function (attrs, options) {
            //incorporate gametype
            _.extend(this, options.type);

            //create collections
            this.boards =  new (Backbone.Collection.extend({ model: Board }))();
            this.decks =   new (Backbone.Collection.extend({ model: Deck }))();
            this.cards =   new (Backbone.Collection.extend({ model: Card }))();
            this.players = new (Backbone.Collection.extend({ model: Player }))();
            this.turns =   new (Backbone.Collection.extend({ model: Turn }))();
        },

        end: function () {
            //call function for gametype
            this.onEnd();

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
                this.nextTurn(); //first turn!
            }
            return result;
        },

        nextTurn: function () {
            //add a new turn object (these don't contain any info at this time)
            this.turns.add({});
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
                rotation:   options.rotation,
                rotateLock: options.rotateLock,
                moveLock:   options.moveLock
            }, {
                game:       this,
                holder:     options.holder,
                paths:      options.paths
            });
            this.cards.add(card);
            return card;
        },

        newDeck: function (options) {
            var deck = new Deck({
                popLock:    options.popLock,
                cardCreator:options.cardCreator
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

        // RULE FUNCTIONS - overwrite these in a gametype.
        validateStart: function (setup) {},
        setup: function (setup) {},
        onEnd: function () {}

    });
});