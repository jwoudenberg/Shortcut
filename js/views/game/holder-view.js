// --- HOLDER VIEW ---
/* Renders a holder. Is always part of a bigger structure (board, deck). */

define(['jquery', 'jqueryui', 'backbone'],
function ($, jQueryUi, Backbone) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'holder cardSized',

        events: {
            'drop': 'drop'
        },

        initialize: function () {
            //set attributes
            this.$el.attr({
                'data-col': this.model.get('col'),
                'data-row': this.model.get('row'),
                'data-cid': this.model.cid
            });

            //make holder droppable (uses jquery-ui)
            this.$el.droppable({});

            //listen for change in lock
            this.model.on('change:acceptLock', this.updateAcceptLock, this);

            this.render();
        },

        render: function () {
            this.updateAcceptLock(); //set correct locked/unlocked behaviour
        },

        drop: function (event, ui) {
            var $card = ui.draggable,
                card;
            //remove positioning-css in style-attribute
            $card.css({left: 0, top: 0, position: 'absolute'});
            card = this.model.game.cards.
                getByCid($card.attr('data-cid'));
            card.set('holder', this.model);
        },

        updateAcceptLock: function () {
            var moveLock = this.model.get('acceptLock');
            if (moveLock) {
                this.$el.removeClass('accepting');
            }
            else {
                this.$el.addClass('accepting');
            }
        }

    });
});