// --- DECKS ---
//A collection of decks

define(['backbone', 'js/models/deck'],
function (Backbone, Deck) {
    return Backbone.Collection.extend({
        model: Deck
    });
});