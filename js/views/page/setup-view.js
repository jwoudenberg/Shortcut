// --- SETUP VIEW ---

/*
This view fills the content section of the page with setup-related fields.

Once the user starts the game, it will create a gametype object (currently only
one exists) and attempt to start it. If it succeeds, this view creates a
game-view and then destroys itself. If not, an error is displayed.
*/

define(['jquery', 'backbone', 'js/models/gametype',
    'js/views/game/gametype-view', 'text!templates/setup.html'],
function ($, Backbone, Gametype, GametypeView, setupTemplate) {
    return Backbone.View.extend({

        tagName:    'div',
        id:         'setup',

        initialize: function () {
            this.render();
        },

        events: {
            'change #playerList li:last-child input': 'addPlayer',
            'click button[name=start]': 'start'
        },

        render: function () {
        //render sets these values to defaults. call once.
            this.$el.html(setupTemplate).appendTo('#content');
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
                i, name, playerNames = [], view, result;

            //get players from page
            for (i = $('#playerList li').length; i--;) {
                //extract a name
                name = $('#playerList li:eq(' + i + ') input').attr('value');
                if (name !== '') {
                    //if not an empty field, add a new player with this name
                    playerNames.push(name);
                }
            }

            //create new gametype-view, which will create the corresponding game
            view = new GametypeView();
            result = view.model.start({
                playerNames: playerNames,
                boardSize: boardSize
            });

            //check if game-start is succesfull
            if (result === true) {
                //this view is no longer usefull
                this.remove();
            }
            else {
                //delte game view again
                view.remove();
                //temporary and very ugly way of showing errors
                alert(result);
            }
        }

    });
});