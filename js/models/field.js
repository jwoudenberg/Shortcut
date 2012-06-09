/*  --- FIELD --- (extends Holder)

    A holder that is part of a board

    METHODS
    step (          string direction)


    PROPERTIES
    board:          model Board

    ATTRIBUTES
    row:            number
    col:            number

    CONSTRUCTOR OPTIONS
*/
define(['js/models/holder'],
function (Holder) {
    return Holder.extend({

        board:  undefined,

        defaults: {
            row:    undefined,
            col:    undefined
        },

        validate: function (attrs) {
            if (attrs.row === undefined) {
                throw new Error("Field: field needs row attribute.");
            }
            if (attrs.col === undefined) {
                throw new Error("Field: field needs col attribute.");
            }
        },

        initialize: function (attrs, options) {
            //check for and set reference to board
            if (!options.board) {
                throw new Error("Field: field needs reference to board.");
            }
            this.board = options.board;

            //call inherited method
            Holder.prototype.initialize.call(this, attrs, options);
        },

        end: function () {
            delete this.board;

            //call inherited function
            Holder.prototype.end.call(this);
        },

        step: function (direction) {
            var x = this.get('row'),
                y = this.get('col'),
                nextField;

            switch (direction) {
                case 'up':
                    nextField = this.board.getField(x - 1, y);
                    break;
                case 'right':
                    nextField = this.board.getField(x, y + 1);
                    break;
                case 'down':
                    nextField = this.board.getField(x + 1, y);
                    break;
                case 'left':
                    nextField = this.board.getField(x, y - 1);
                    break;
                default:
                    throw new Error('field.step: Invalid direction');
            }

            return nextField;
        }

    });
});