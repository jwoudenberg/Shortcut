// --- SETUP VIEW ---

/*
This view fills the content section of the page with setup-related fields.

Once the user starts the game, it will create a gametype object (currently only
one exists) and attempt to start it. If it succeeds, this view creates a
game-view and then destroys itself. If not, an error is displayed.
*/

define(['jquery', 'backbone', 'mustache', 'js/models/gametype',
    'js/views/game-view', 'text!templates/setup.mustache'],
function ($, Backbone, Mustache, Gametype, GameView, setupTemplate) {
    return Backbone.View.extend({

        tagName: 'div',
        id: 'setup',

        initialize: function () {
            this.render();
        },

        events: {
            'change #playerList li:last-child input': 'addPlayer',
            'click #beginButton': 'start'
        },

        render: function () {
        //render sets these values to defaults. call once.
            this.$el.html(Mustache.render(setupTemplate, {
                players: [{ name: 'Player 1' }, { name: 'Player 2' }],
                boardSize: 2
            }));
            $('#content').empty().append(this.$el);
        },

        addPlayer: function () {
        //add an additional item to the list
            $('#playerList').append('<li><input type="text" value="" /></li>');
        },

        start: function () {
        //reads values from the page and creates a new gametype-model with them
        //can be called several times if earlier start-attempts fail

            //get boardsize from page
            var boardSize = parseInt($('#boardSize').attr('value'), 10),
                i, name, playerNames = [], game, result;

            //get players from page
            for (i = $('#playerList li').length; i--;) {
                //extract a name
                name = $('#playerList li:eq(' + i + ') input').attr('value');
                if (name !== '') {
                    //if not an empty field, add a new player with this name
                    playerNames.push(name);
                }
            }

            //create new gametype with view and attempt to start it
            game = new Gametype();
            new GameView({ model: game });
            result = game.start({
                playerNames: playerNames,
                boardSize: boardSize
            });

            //check if game-start is succesfull
            if (result === true) {
                //this view is no longer needed
                this.remove();
            }
            else {
                //temporary and very ugly way of showing errors
                alert(result);
            }
        }

    });
});