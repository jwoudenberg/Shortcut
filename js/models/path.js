/*  --- Path ---

    A path connects ports in a card. It always has at least a start port, and
    possibly an end port. Without an end port, the path is a dead end.

    METHODS
    setOwner (      model Player )

    PROPERTIES
    card:           model Card

    ATTRIBUTES
    start:          number
    [end:           number          ('unconnected') ]
    [owner:         model Player    (undefined)     ]

    CONSTRUCTOR OPTIONS
    card:           model Card
*/
define(['backbone'],
function (Backbone) {
    return Backbone.Model.extend({

    card: undefined,
    owner: undefined, //cached reference back to owner, set by owner

        defaults: {
            //mandatory
            start: undefined,
            //optional
            end: 'unconnected'
        },

        validate: function (attrs) {
            if (attrs.start === undefined) {
                return "Path: path needs at least a starting port.";
            }
        },

        initialize: function (attrs, options) {
            //check for and set reference to game
            if (!options.card) {
                throw new Error("Path: path needs reference to card.");
            }
            this.card = options.card;

            //check if an owner was provided
            if (options.owner) {
                options.owner.addBase(this);
            }
        },

        end: function () {
            this.trigger('end');

            delete this.card;
            delete this.owner;
        }

    });
});