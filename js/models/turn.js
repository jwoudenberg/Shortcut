/* --- TURN ---
    
*/
define(['backbone'],
function (Backbone) {
    return Backbone.Model.extend({

            owner: undefined,
            actions: undefined,

        defaults: {},

        initialize: function () {
            this.actions = [];
        },

        end: function () {
            //delete references
            delete this.owner;
            delete this.actions;
        }

    });
});