// --- GAME VIEW ---
//view that encompasses the game

define(['backbone', 'js/views/board-view', 'js/views/card-view',
'js/views/deck-view', 'js/views/menu-view'],
function (Backbone, BoardView, CardView, DeckView, MenuView) {
    return Backbone.View.extend({

        initialize: function () {
            //on the first turn, call render()
            this.model.turns.on('add', function () {
                this.render();
                this.model.turns.off('add');
            }, this);

            //when a board gets added, call addBoard()
            this.model.boards.on('add', function (board) {
                this.addBoard(board);
            }, this);

            //when a card gets added, call addCard()
            this.model.cards.on('add', function (card) {
                this.addCard(card);
            }, this);

            //when a deck gets added, call addDeck()
            this.model.decks.on('add', function (deck) {
                this.addDeck(deck);
            }, this);
        },

        render: function () {
        //called when the game is started
            new MenuView();
        },

        addBoard: function (board) {
            new BoardView({ model: board });
        },

        addCard: function (card) {
            new CardView({ model: card });
        },

        addDeck: function (deck) {
            new DeckView({ model: deck });
        }

    });
});