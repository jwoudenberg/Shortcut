/*  --- Path ---

    Contains information about a player. Players can have bases (paths).

    METHODS
    addBase (       model Path )
    removeBase (    model Path )

    PROPERTIES
    game:           model Game
    bases:          collection of model Path

    ATTRIBUTES
    name:           string

    CONSTRUCTOR OPTIONS
*/
define(['backbone', 'js/models/path'],
function (Backbone, Path) {
    return Backbone.Model.extend({

        game:   undefined,
        bases:  undefined,

        defaults: {
            //mandatory
            name: undefined
        },

        validate: function (attrs) {
            if (attrs.name === undefined) {
                throw new Error("Player: player needs name attribute.");
            }
        },

        initialize: function (attrs, options) {
            //check for and set reference to game
            if (!options.game) {
                throw new Error("Player: player needs reference to game.");
            }
            this.game = options.game;

            this.bases = new (Backbone.Collection.extend({ model: Path }))();
        },

        end: function () {
            //delete references
            delete this.game;
            delete this.bases;
        },

        addBase: function (base) {
            //check if base already has an owner
            if (base.owner) {
                //remove base from that owner
                base.owner.removeBase(base);
            }

            //add base to collection and set reference back
            this.bases.add(base);
            base.owner = this;

            //trigger events
            base.trigger('owner:claimed', [this]);
            this.trigger('base:add', [base]);
        },

        removeBase: function (base) {
            //remove references
            this.bases.remove(base);
            delete base.owner;

            //trigger events
            base.trigger('owner:unclaimed', [this]);
            this.trigger('base:remove', [base]);
        }

    });
});