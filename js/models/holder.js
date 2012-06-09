/*  --- HOLDER ---

    A holder is a general card container. It is generally extended before use.

    METHODS
    checkIn (       model Card [, bool overrideLocks] )
    checkOut ()

    PROPERTIES
    game:           model Game
    card:           model Card

    ATTRIBUTES
    [acceptLock:    bool    (false) ]

    CONSTRUCTOR OPTIONS
    game:           model Game
    [card:          model Card      (undefined) ]
*/
define(['backbone'],
function (Backbone) {
    return Backbone.Model.extend({

        game: undefined,
        card: undefined,

        defaults: {
            //optional
            acceptLock: false
        },

        initialize: function (attrs, options) {
            //check for and set reference to game
            if (!options.game) {
                throw new Error("Holder: holder needs reference to game.");
            }
            this.game = options.game;
        },

        end: function () {
            //delete references
            delete this.game;
            delete this.card;
        },

        checkIn: function (card, overrideLocks) {
            //adds a card to this holder, if this is allowe
            var problems;

            //check if newCard is supplied
            if (card === undefined) {
                throw new Error("Holder: checkIn called without card argument");
            }

            //check if action is allowed by checking all possible obstacles
            problems = [];
            if (this.card !== undefined) {
                //holder cannot contain more than one card
                problems.push('holder already occupied');
            }
            if (overrideLocks !== true) {
                //locks aren't overridden
                if (this.get('acceptLock') === false) {
                    problems.push('holder locked');       
                }
                if (this.get('moveLock') === false) {
                    problems.push('card move-locked');
                }
            }

            if (problems.length > 0) {
                //could not check card in
                return problems;
            }
            else {
                //no problems encountered actually move the card
                if (card.holder) {
                    card.holder.checkOut();     //checkout at old holder
                }
                this.card = card;               //add to this holder
                card.holder = this;             //add reference back here

                //trigger events on the holder and the card
                this.trigger('card:checkIn', [card]);
                card.trigger('move', this);

                return true;
            }
        },

        //remove card from holder
        checkOut: function () {
            var oldCard = this.card;
            delete this.card;
            this.trigger('card:checkOut', [oldCard]);
            return true;
        }

    });
});