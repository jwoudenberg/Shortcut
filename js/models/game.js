// --- GAME ---

/*
Contains collections of containing all game-related model-types and methods
to start a game and go to the next turn.

This model needs to be extended to a gametype to be usefull. This gametype model
will add rule-logic by overwriting some of the game models functions.
*/

define(['backbone', 'js/collections/boards', 'js/collections/decks',
    'js/collections/cards', 'js/collections/players', 'js/collections/turns',
    'js/models/board', 'js/models/deck', 'js/models/card', 'js/models/player'],
function (Backbone, Boards, Decks, Cards, Players, Turns,
    Board, Deck, Card, Player) {
    return Backbone.Model.extend({

        boards: undefined,
        decks: undefined,
        cards: undefined,
        players: undefined,
        turns: undefined,

        initialize: function () {
            //create collections
            this.boards =  new Boards();
            this.decks =   new Decks();
            this.cards =   new Cards();
            this.players = new Players();
            this.turns =   new Turns();
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
                game:   this,
                size:   options.size
            });
            this.boards.add(board);
            return board;
        },

        newCard: function (options) {
            var card = new Card({
                game:       this,
                rotation:   options.rotation,
                rotateLock: options.rotateLock,
                moveLock:   options.moveLock
            }, {
                holder:     options.holder,
                paths:      options.paths
            });
            this.cards.add(card);
            return card;
        },

        newDeck: function (options) {
            var deck = new Deck({
                game:       this,
                popLock:    options.popLock,
                cardCreator:options.cardCreator
            });
            this.decks.add(deck);
            return deck;
        },

        newPlayer: function (options) {
            var player = new Player({
                game:       this,
                name:       options.name
            });
            this.players.add(player);
            return player;
        },

        // RULE FUNCTIONS - overwrite these in a gametype.
        validateStart: function (setup) {},
        setup: function (setup) {}

    });
});