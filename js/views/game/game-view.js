// --- GAME VIEW ---

/*
Listens to the game to create views when game-elements are created

This model needs to be extended to a gametype-view to be usefull. This extension
will layout the game corresponding to a specific gametype.
*/

define(['jquery', 'backbone', 'js/views/game/board-view', 'js/views/game/card-view',
'js/views/game/deck-view', 'js/views/page/menu-view'],
function ($, Backbone, BoardView, CardView, DeckView, MenuView) {
    return Backbone.View.extend({

        tagName: 'div',
        id: 'game',

        initialize: function () {
            //check if GameType is set
            if (this.GameType === undefined) {
                throw new Error("Game View: Game View needs a GameType.");
            }
            //create the gametype
            this.model = new this.GameType();

            //on the first turn, call render()
            this.model.turns.on('add', function () {
                this.render();
                this.model.turns.off('add', null, this);
            }, this);


            //when a board, card or deck gets added, create its view, then
            //call a function that can be overwritten by gametype-view
            this.model.boards.on('add', function (board) {
                var view = new BoardView({
                    model: board,
                    gameView: this
                });
                this.newBoard(board, view);
            }, this);

            this.model.cards.on('add', function (card) {
                var view = new CardView({
                    model: card,
                    gameView: this
                });
                this.newCard(card, view);
            }, this);

            this.model.decks.on('add', function (deck) {
                var view = new DeckView({
                    model: deck,
                    gameView: this
                });
                this.newDeck(deck, view);
            }, this);


            //when the window is resized, fire the resize() function
            var self = this;
            $(window).resize(function () {
                self.resize();
            });
        },

        render: function () {
        //called when the game is started
            this.resize();
            this.$el.appendTo('#content');
            new MenuView({ el: 'menu' });
        },

        // RULE FUNCTIONS - overwrite these in a gametype-view.
        newBoard: function (board, view) {},
        newCard: function (card, view) {},
        newDeck: function (deck, view) {},
        resize: function () {} //called when size of gamewindow changes

    });
});