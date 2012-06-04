// --- BOARD ---
//a collection of fields in which cards can be placed, placed in a grid

define(['backbone', 'js/collections/fields'],
function (Backbone, Fields) {
    return Backbone.Model.extend({

        fields: undefined,

        defaults: {
            //mandatory
            game: undefined,
            size:  undefined
        },

        validate: function (attrs) {
            if (attrs.game === undefined) {
                throw new Error("Board: board needs game attribute.");
            }
            if (attrs.size === undefined) {
                throw new Error("Board: board needs size attribute.");
            }
            else if (typeof attrs.size !== 'number') {
                throw new Error("Board: size needs to be a number.");
            }
        },

        initialize: function () {
            var size, col, row;

            //create field-collection
            this.fields = new Fields();

            //populate collection with fields
            size = this.get('size');
            for (row = 0; row < size; row++) { //loop over all rows
                for (col = 0; col < size; col++) { //loop over all collumns
                    this.fields.add({
                        'game': this.get('game'),
                        'board': this,
                        'row': row,
                        'col': col
                    });
                }
            }
        },

        getField: function (row, col) {
        //find a field at specific coördinates
            return this.fields.where({
                row: row,
                col: col
            })[0];
        }

    });
});