// --- PLAYER ---
/*  Refers to the player. It refers to a collection of bases. Paths can be added
    and removed from that collection by calling functions on the path
*/
define(['backbone', 'js/collections/paths'],
function (Backbone, Paths) {
    return Backbone.Model.extend({

        bases: undefined,

        defaults: {
            //mandatory
            game: undefined,
            name: undefined
        },

        validate: function (attrs) {
            if (attrs.game === undefined) {
                throw new Error("Player: player needs game attribute.");
            }
            if (attrs.name === undefined) {
                throw new Error("Player: player needs name attribute.");
            }
        },

        initialize: function () {
            this.bases = new Paths();
        }

    });
});