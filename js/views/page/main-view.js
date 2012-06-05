// --- MAIN VIEW ---

/*
This view sets up the outer page elements and then calls the setup view, which
will populate the content section of the page.

A game is not yet created, because it is not yet known what type of game needs
to be created.
*/

define(['jquery', 'backbone', 'js/views/page/setup-view'],
function ($, Backbone, SetupView) {
    return Backbone.View.extend({

        initialize: function () {
            var self = this;
            $(document).ready(function () {
                self.render();
            });
        },

        render: function () {
            //set the body element as this views element
            this.setElement('body');

            //clean out content section and disable the context menu
            $('#content').empty().bind('contextmenu', function () {
                return false; //disable context menu
            });

            //show the setup screen
            new SetupView();
        }

    });
});