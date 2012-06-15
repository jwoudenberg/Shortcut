// --- HOLDER VIEW ---
/* Renders a holder. Is always part of a bigger structure (board, deck). */

define(['jqueryui', 'backbone', 'js/views/game/card-view'],
function (jQueryUi, Backbone, CardView) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'holder',

        events: {
            'drop': 'drop'
        },

        initialize: function () {
            var card;

            //set attributes
            this.$el.attr({
                'data-col': this.model.get('col'),
                'data-row': this.model.get('row'),
                'data-cid': this.model.cid
            });

            //make holder droppable (uses jquery-ui)
            this.$el.droppable({});

            //create view for card in holder, if it exists
            card = this.model.card();
            if (card) this.createCardView(card);

            //listen for change to model
            this.model.on('change:acceptLock', this.updateAcceptLock, this);
            this.model.on('card:checkIn', this.createCardView, this);
            this.model.on('card:checkOut', function () {
                this.$el.empty();
            }, this);
            this.model.on('end', this.remove, this);

            this.render();
        },

        render: function () {
            this.updateAcceptLock(); //set correct locked/unlocked behaviour
        },

        remove: function () {
            //call inherited function
            Backbone.View.prototype.remove.call(this);

            //remove callbacks
            this.model.off(null, null, this);
        },

        createCardView: function (card) {
            var view = new CardView({ model: card });
            view.$el.appendTo(this.$el);
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