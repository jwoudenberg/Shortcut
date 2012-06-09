/*  --- BOARD ---

    A board is a collection of fields placed in a (rectangular) grid.

    METHODS
    getField (      number row, number col )

    PROPERTIES
    game:           model Game
    fields:         collection of model Field

    ATTRIBUTES
    size:           number

    CONSTRUCTOR OPTIONS
    game:           model Game
*/

define(['backbone', 'js/models/field'],
function (Backbone, Field) {
    return Backbone.Model.extend({

        game:   undefined,
        fields: undefined,

        defaults: {
            size:  undefined
        },

        validate: function (attrs) {
            if (attrs.size === undefined) {
                throw new Error("Board: board needs size attribute.");
            }
            else if (typeof attrs.size !== 'number') {
                throw new Error("Board: size needs to be a number.");
            }
        },

        initialize: function (attrs, options) {
            var size, col, row;

            //check for and set reference to game
            if (!options.game) {
                throw new Error("Board: board needs reference to game.");
            }
            this.game = options.game;

            //create field-collection
            this.fields = new (Backbone.Collection.extend({ model: Field }))();

            //populate collection with fields
            size = this.get('size');
            for (row = 0; row < size; row++) { //loop over all rows
                for (col = 0; col < size; col++) { //loop over all collumns
                    this.fields.add({
                        'row': row,
                        'col': col
                    }, {
                        'game': this.game,
                        'board': this
                    });
                }
            }
        },

        end: function () {
            //end fields
            this.fields.forEach(function (field) {
                field.end();
            }, this);

            //delete references
            delete this.game;
            delete this.fields;
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