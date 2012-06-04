// --- PATHS ---
//A collection of paths

define(['backbone', 'js/models/path'],
function (Backbone, Path) {
    return Backbone.Collection.extend({
        model: Path
    });
});