// --- TURNS ---
//A collection of turns

define(['backbone', 'js/models/turn'],
function (Backbone, Turn) {
    return Backbone.Collection.extend({
        model: Turn
    });
});