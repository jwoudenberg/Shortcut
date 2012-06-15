/* --- GAME VIEW ---

Renders all game elements. Needs to be extended to Gametype View to be usefull

OVERWRITE WITH GAMETYPE VIEW
withNewBoard(boardView) - called when a new boardView is added
withNewDeck(deckView)   - called when a new deckView is added
arrange()               - called when the gameview needs to be rearranged,
                          for instance when the window size changes
*/

define(['jquery', 'underscore', 'backbone', 'js/views/game/board-view',
    'js/views/game/deck-view', 'js/views/game/player-view',
    'text!templates/rules.html', 'text!templates/confirmation.html'],
function ($, _, Backbone, BoardView, DeckView, PlayerView,  ruleTemplate,
        confirmationTemplate) {
    return Backbone.View.extend({

        tagName: 'div',
        id: 'game',
        //set in initialize()

        initialize: function (options) {
            //check if GameType is set
            if (this.model === undefined) {
                throw new Error("Game View: Game View needs a model (Game).");
            }

            //get link back to mainView variable from the initialization options
            this.mainView = options.mainView;

            //incorporate gametype-view
            _.extend(this, options.type);

            //call function for view-type
            this.onStart();
        },

        //these are added to menu when this view is made contentView by mainView
        menuOptions: {
            'next turn': function () {
                var validation = this.model.nextTurn();
                if (validation !== true) this.mainView.postMessage(validation);
            },
            'rules': function() {
                this.mainView.showText(ruleTemplate);
            },
            'new game': function () {
                var confirmation = this.mainView.showText(confirmationTemplate),
                    gameView = this;

                //attach events for the confirmation, buttons
                confirmation.delegateEvents({
                    'click button[name=close], button[name=no]': 'remove',
                    'click button[name=yes]':   function () {
                        this.mainView.setup();
                        gameView.model.end(); //end game
                        this.remove();
                    }
                });
            }
        },

        render: function () {
            //(re)renders al game elements.
            this.$el.empty(); //start with a clean slate

            //create views for all boards, decks and cards
            this.model.boards.forEach(this.createBoardView, this);
            this.model.decks.forEach(this.createDeckView, this);
            this.model.players.forEach(this.createPlayerView, this);

            this.arrange(); //update the layout of the game

            //listen for changes
            //when a board, deck or player gets added, rerender the game
            this.model.boards.on('add', this.render, this);
            this.model.decks.on('add', this.render, this);
            this.model.players.on('add', this.render, this);

            //other events trigger a function that the view-type can overwrite
            this.model.turns.on('add', this.onNewTurn, this);
            this.model.on('route', this.onNewRoute, this);
            this.model.on('finish', this.onFinish, this);
        },

        remove: function () {
            //call inherited remove function
            Backbone.View.prototype.remove.call(this);

            //remove callbacks
            this.model.boards.off(null, null, this);
            this.model.cards.off(null, null, this);
            this.model.decks.off(null, null, this);
            this.model.players.off(null, null, this);
            this.model.turns.off(null, null, this);
            this.model.off(null, null, this);

            //call close formula for gametype-view
            this.close();
        },

        createBoardView: function (board) {
            var view = new BoardView({ model: board });
            view.$el.appendTo(this.$el);
            this.withNewBoard(view);
            return view;
        },

        createDeckView: function (deck) {
            var view = new DeckView({ model: deck });
            view.$el.appendTo(this.$el);
            this.withNewDeck(view);
            return view;
        },

        createPlayerView: function (player) {
            var view = new PlayerView({ model: player });
            view.$el.appendTo(this.$el);
            this.withNewPlayer(view);
            return view;
        },

        //FUNCTIONS - overwrite these in a gametype-view.
        withNewBoard: function (boardView) {},
        withNewDeck: function (deckView) {},
        withNewPlayer: function (playerView) {},
        onStart: function () {},
        onNewTurn: function (turn) {},
        onNewRoute: function (route) {},
        onFinish: function (winners) {},
        arrange: function () {},    //updates the layout of the game elements
        close: function () {}       //called when the view is removed

    });
});