/*  --- HOLDER ---

    A holder is a general card container. It is generally extended before use.

    METHODS
    card ()

    PROPERTIES
    game:           model Game
    _card:          model Card

    ATTRIBUTES
    [acceptLock:    bool    (false)     ]

    CONSTRUCTOR OPTIONS
    game:           model Game
*/
define(['backbone'],
function (Backbone) {
    return Backbone.Model.extend({

        game: undefined,
        _card: undefined, //cached reference

        defaults: {
            acceptLock: false
        },

        initialize: function (attrs, options) {
            //check for and set reference to game
            if (!options.game) {
                throw new Error("Holder: holder needs reference to game.");
            }
            this.game = options.game;

            //listen to card events to trigger own events
            this.game.cards.on('change:holder', function (card, newHolder) {
                if (newHolder === this) {
                    this._card = card;
                    this.trigger('card:checkIn', card);
                }
                else if (card.previous('holder') === this) {
                    delete this._card;
                    this.trigger('card:checkOut', card);
                }
            }, this);
        },

        card: function () {
            //first, check if we have a cached reference to card
            if (this._card) {
                return this._card;
            }
            else {
                //find the card placed in this holder
                var cards = this.game.cards.where({ holder: this });
                if (cards.length === 0) {
                    //none found
                    return undefined;
                }
                else {
                    //one found (it should be the only one)
                    return cards[0];
                }
            }
        },

        end: function () {
            this.trigger('end');

            //stop listening
            this.game.cards.off(null, null, this);

            //delete references
            delete this.game;
            if (this._card) {
                delete this._card;
            }
        }

    });
});