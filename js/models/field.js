// --- FIELD ---
//An element that holds card. inherits from holder
define(['js/models/holder'],
function (Holder) {
    return Holder.extend({

        defaults: {
            //mandatory
            board:  undefined,
            row:    undefined,
            col:    undefined
        },

        validate: function (attrs) {
            if (attrs.board === undefined) {
                throw new Error("Field: field needs board attribute.");
            }
            if (attrs.row === undefined) {
                throw new Error("Field: field needs row attribute.");
            }
            if (attrs.col === undefined) {
                throw new Error("Field: field needs col attribute.");
            }
        },

        step: function (direction) {
            var x = this.get('row'),
                y = this.get('col'),
                nextField;

            switch (direction) {
                case 'up':
                    nextField = this.get('board').getField(x - 1, y);
                    break;
                case 'right':
                    nextField = this.get('board').getField(x, y + 1);
                    break;
                case 'down':
                    nextField = this.get('board').getField(x + 1, y);
                    break;
                case 'left':
                    nextField = this.get('board').getField(x, y - 1);
                    break;
                default:
                    throw new Error('field.step: Invalid direction');
            }

            return nextField;
        }

    });
});