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

        pop: function (card) {
        //pop a card on this deck. Uses supplied card if available, otherwise
        //generate a random card

            if (this.get('popLock') === true) {
                return 'deck locked';
            }
            else if (card !== undefined) {
                //if a card is supplied, this overrules the use of cardCreator()
                return card.move(this, true);
            }
            else {
                return this.game.newCard(makeRandomProtoCard(this));
            }
        }

    });
});