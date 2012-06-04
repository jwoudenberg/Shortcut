// --- MAIN VIEW ---

/*
This view sets up the outer page elements and then calls the setup view, which
will populate the content section of the page.

A game is not yet created, because it is not yet known what type of game needs
to be created.
*/

define(['jquery', 'backbone', 'mustache', 'js/views/setup-view',
    'text!templates/page.mustache'],
function ($, Backbone, Mustache, SetupView, pageTemplate) {
    return Backbone.View.extend({

        tagName: 'div',
        id: 'container',

        initialize: function () {
            this.render();

            //the setup screen will populate the game model, then start the game
            new SetupView();
        },

        render: function () {
        //renders the main page elements. run once.
            this.$el.append(Mustache.render(pageTemplate));

            //only call to ready() in entire app.
            //other views can always append to this views element, whether it
            //is connected to the DOM or not.
            var self = this;
            $(document).ready(function () {
                $('body').bind('contextmenu', function () {
                    return false; //disable context menu
                }).append(self.$el); //connect view to DOM
            });
        }

    });
});