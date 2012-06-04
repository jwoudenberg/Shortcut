// --- PLAYERS ---
//A collection of players

define(['backbone', 'js/models/player'],
function (Backbone, Player) {
    return Backbone.Collection.extend({
        model: Player
    });
});