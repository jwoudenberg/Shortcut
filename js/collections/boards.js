// --- Boards ---
//A collection of boards

define(['backbone', 'js/models/board'],
function (Backbone, Board) {
    return Backbone.Collection.extend({
        model: Board
    });
});