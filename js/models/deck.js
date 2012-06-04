// --- DECK ---
/* A deck is a single holder, with a function pop() that puts a card in it.
   To generate said card, a cardCreator function can be set. If said card is
   move-locked, popping will fail. */

define(['js/models/holder'],
function (Holder) {
    return Holder.extend({

        defaults: {
            //automatically set
            game: undefined,
            //optional
            card: undefined,
            acceptLock: true,
            popLock: false,
            cardCreator: undefined
        },

        pop: function (card) {
        //pop a card on this deck. Uses supplied card if available, otherwise
        //generate a card using popAlgorithm.
            var cardCreator = this.get('cardCreator'),
                result;

            if (this.get('popLock') === true) {
                result = 'deck locked';
            }
            else if (card !== undefined) {
                //if a card is supplied, this overrules the use of cardCreator()
                result = card.move(this, true);
            }
            else if (cardCreator !== undefined) {
                card = cardCreator(this.get('game'));
                result = card.move(this, true);
            }
            else {
                throw new Error("Deck: deck.pop() was supplied neither a card, nor a cardCreator().");
            }
            return result;
        }

    });
});