// --- HOLDER ---
//An element that holds card
define(['backbone'],
function (Backbone) {
    return Backbone.Model.extend({

        defaults: {
            //mandatory
            game: undefined,
            //optional
            card: undefined,
            acceptLock: false
        },

        validate: function (attrs) {
            if (attrs.game === undefined) {
                throw new Error("Holder: holder needs game attribute.");
            }
        },

        //add card to holder 
        checkIn: function (newCard, overrideLocks) {
            var result;

            //check if newCard is supplied
            if (newCard === undefined) {
                throw new Error("Holder: checkIn called without card argument");
            }

            //only add if holder is unlocked and empty
            if (this.get('acceptLock') && overrideLocks !== true) {
                result = 'holder locked';
            }
            else if (this.get('card') !== undefined) {
                result = 'holder already occupied';
            }
            else {
                result = true;
                this.set({ card: newCard });
            }
            return result;
        },

        //remove card from holder
        checkOut: function () {
            this.set({ card: undefined });
            return true;
        }

    });
});