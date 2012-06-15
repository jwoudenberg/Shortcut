/* --- PLAYER VIEW ---

    Renders player related elements
*/
define(['jquery', 'backbone'],
function ($, Backbone) {
    return Backbone.View.extend({

        events: {},

        initialize: function (options) {
            //listen for model events
            this.model.on('end', this.remove, this);
        },

        render: function () {},

        remove: function () {
            //call inherited function
            Backbone.View.prototype.remove.call(this);

            //remove callbacks
            this.model.off(null, null, this);
        }

    });
});