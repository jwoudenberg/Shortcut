// --- FIELDS ---
//A collection of fields

define(['backbone', 'js/models/field'],
function (Backbone, Field) {
    return Backbone.Collection.extend({
        model: Field
    });
});