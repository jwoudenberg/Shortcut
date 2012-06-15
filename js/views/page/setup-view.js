/* --- SETUP VIEW ---

This view fills the content section of the page with setup-related fields.

Once the user starts the game, it will create a gametype object (currently only
one exists) and attempt to start it. If it succeeds, this view creates a
game-view and then destroys itself. If not, an error is displayed.

FUNCTIONS
start() - attempts to start a game with whatever settings the user has selected
*/

define(['jquery', 'backbone', 'js/models/game.js', 'js/views/game/game-view.js',
    'js/helpers/gametypes.js', 'text!templates/setup.html'],
function ($, Backbone, Game, GameView, gametypes, setupTemplate) {
    return Backbone.View.extend({

        tagName:    'div',
        id:         'setup',

        initialize: function (options) {
            //get link back to mainView variable from the initialization options
            this.mainView = options.mainView;
        },

        events: {
            'change #playerList li':    'changePlayer',
            'click button[name=start]': 'start'
        },

        render: function () {
        //render sets these values to defaults. call once.
            this.$el.html(setupTemplate);
        },

        changePlayer: function (event) {
            //add or remove a player-name input field
            var $target = $(event.target);
            if ($target.attr('value') !== '') {
                if ($('#playerList li:last input').attr('value') !== '') {
                    $('#playerList').append('<li><input type="text" value="" /></li>');
                }
            }
            else if (!$target.is('#playerList li:last')) {
                $target.parent().remove();
            }
        },

        start: function () {
        //reads values from the page and creates a new gametype-model with them
        //can be called several times if earlier start-attempts fail

            //get boardsize from page
            var boardSize = parseInt($('#boardSize').attr('value'), 10),
                i, name, playerNames = [], game, view, result, options;

            //get players from page
            for (i = $('#playerList li').length; i--;) {
                //extract a name
                name = $('#playerList li:eq(' + i + ') input').attr('value');
                if (typeof name === 'string' && name !== '') {
                    //if not an empty field, add a new player with this name
                    playerNames.push(name);
                }
            }

            //create object to pass to game constructor
            options = {
                playerNames: playerNames,
                boardSize: boardSize
            };

            //check validity of options by passing to gametype function directly
            //creation of Game object is unnecessary
            result = gametypes['default'].type.validateStart(options);

            //check if validation was succesfull
            if (result !== true) this.mainView.postMessage(result);
            else {
                //create new game
                game = new Game({}, { type: gametypes['default'].type });
                //try to start
                result = game.start(options);

                //the same validation is performed, so this should be true
                if (result === true) {
                     view = new GameView({
                        model:  game,
                        type:   gametypes['default'].view,
                        mainView:   this.mainView
                    });
                    //hand over content area to new view
                    this.mainView.changeContentView(view);
                }
                else {
                    throw new Error("Setup View: Start validations not in agreement");
                }
            }
        }

    });
});