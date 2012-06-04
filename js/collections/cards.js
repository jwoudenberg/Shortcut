// --- Cards ---
//A collection of cards

define(['backbone', 'js/models/card'],
function (Backbone, Card) {
    return Backbone.Collection.extend({
        model: Card
    });
});