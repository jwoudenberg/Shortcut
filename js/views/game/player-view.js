/* --- PLAYER VIEW ---

    Renders player related elements
*/
define(['jquery', 'backbone'],
function ($, Backbone) {
    return Backbone.View.extend({

        events: {},

        initialize: function (options) {
            //create reference back to gameView
            this.gameView = options.gameView;
        },

        render: function () {}

    });
});