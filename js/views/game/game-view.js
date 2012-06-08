/* --- GAME VIEW ---

Renders all game elements. Needs to be extended to Gametype View to be usefull

OVERWRITE WITH GAMETYPE VIEW
withNewBoard(boardView) - called when a new boardView is added
withNewDeck(deckView)   - called when a new deckView is added
withNewCard(cardView)   - called when a new cardView is added
arrange()               - called when the gameview needs to be rearranged,
                          for instance when the window size changes
*/

define(['jquery', 'underscore', 'backbone', 'js/views/game/board-view',
    'js/views/game/card-view', 'js/views/game/deck-view',
    'text!templates/rules.html', 'text!templates/confirmation.html'],
function ($, _, Backbone, BoardView, CardView, DeckView, ruleTemplate,
        confirmationTemplate) {
    return Backbone.View.extend({

        tagName: 'div',
        id: 'game',
        //set in initialize()

        initialize: function (options) {
            //incorporate gametype-view
            _.extend(this, options.type);

            //check if GameType is set
            if (this.model === undefined) {
                throw new Error("Game View: Game View needs a model (Game).");
            }
        },

        //these are added to menu when this view is made contentView by mainView
        menuOptions: {
            'new game': function () {
                var confirmation = this.mainView.showText(confirmationTemplate);

                //attach events for the confirmation, buttons
                confirmation.delegateEvents({
                    'click button[name=close], button[name=no]': 'remove',
                    'click button[name=yes]':   function () {
                        this.mainView.setup();
                        this.remove();
                    }
                });
            },
            'rules': function() {
                this.mainView.showText(ruleTemplate);
            }
        },

        render: function () {
            //(re)renders al game elements.
            this.$el.empty(); //start with a clean slate

            //create views for all boards, decks and cards
            this.model.boards.forEach(this.createBoardView, this);
            this.model.decks.forEach(this.createDeckView, this);
            this.model.cards.forEach(this.createCardView, this);

            this.arrange(); //update the layout of the game

            //listen for changes
            //when a board, deck or card gets added, rerender the game
            this.model.boards.on('add', this.render, this);
            this.model.decks.on('add', this.render, this);

            //when a card gets added create a view for it
            this.model.cards.on('add', this.createCardView, this);
        },

        remove: function () {
            //call inherited remove function
            Backbone.View.prototype.remove.call(this);

            //remove callbacks
            this.model.boards.off(null, null, this);
            this.model.cards.off(null, null, this);
            this.model.decks.off(null, null, this);

            //call close formula for gametype-view
            this.close();
        },

        createBoardView: function (board) {
            var view = new BoardView({
                model: board,
                gameView: this
            });
            view.$el.appendTo(this.$el);
            this.withNewBoard(view);
            return view;
        },

        createDeckView: function (deck) {
            var view = new DeckView({
                model: deck,
                gameView: this
            });
            view.$el.appendTo(this.$el);
            this.withNewDeck(view);
            return view;
        },

        createCardView: function (card) {
            //note that cardViews are not automatically appended to the DOM,
            //they do that themselves (as they are subviews of a holder)
            var view = new CardView({
                model: card,
                gameView: this
            });
            this.withNewCard(view);
            return view;
        },

        //FUNCTIONS - overwrite these in a gametype-view.
        withNewBoard: function (boardView) {},
        withNewDeck: function (deckView) {},
        withNewCard: function (cardView) {},
        arrange: function () {},    //updates the layout of the game elements
        close: function () {}       //called when the view is removed

    });
});