/*  --- DECK --- (extends Holder)

    A holder that can create new cards.

    METHODS
    pop (           [model Card] )

    PROPERTIES

    ATTRIBUTES
    [acceptLock:    bool    (true)  ]
    [popLock:       bool    (false) ]

    CONSTRUCTOR OPTIONS
*/

define(['js/models/holder', 'js/helpers/makeRandomProtoCard'],
function (Holder, makeRandomProtoCard) {
    return Holder.extend({

        defaults: {
            //optional
            acceptLock: true,
            popLock: false
        },

        flags: {},

        initialize: function () {
            //call inherited function
            Holder.prototype.initialize.apply(this, arguments);

            this.flags = {};
        },

        pop: function () {
        //pop a random card
            var card;
            if (this.get('popLock') || this.flags.pop) return 'deck locked';
            else if (!this.card()) { //if not occupied
                card = this.game.newCard(makeRandomProtoCard(this));
                //create an opportunity for the new card to move to the deck
                this.set('acceptLock', false);
                card.set('holder', this);
                this.set('acceptLock', true);
                return card;
            }
        }

    });
});