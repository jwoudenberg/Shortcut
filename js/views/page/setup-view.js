/* --- SETUP VIEW ---

This view fills the content section of the page with setup-related fields.

Once the user starts the game, it will create a gametype object (currently only
one exists) and attempt to start it. If it succeeds, this view creates a
game-view and then destroys itself. If not, an error is displayed.

FUNCTIONS
start() - attempts to start a game with whatever settings the user has selected
*/

define(['jquery', 'backbone', 'js/helpers/gameTypes.js',
    'text!templates/setup.html'],
function ($, Backbone, gameTypes, setupTemplate) {
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
                $('#playerList').append('<li><input type="text" value="" /></li>');
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

            //create new gametype and corresponding view
            game = new gameTypes['default'].Gametype();
            view = new gameTypes['default'].GametypeView({ model: game });

            //try to start
            options = {
                playerNames: playerNames,
                boardSize: boardSize
            };
            result = view.model.start(options);

            //check if start was succesfull
            if (result === true) {
                //hand over content area to new view
                this.mainView.changeContentView(view);
            }
            else {
                //remove gametypeView again
                view.remove();
                //show error to the user
                this.mainView.postMessage(result);
            }
        }

    });
});