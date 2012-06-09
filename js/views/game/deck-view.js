// --- DECK VIEW ---
/* Renders a deck */

define(['backbone', 'js/views/game/holder-view'],
function (Backbone, HolderView) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'deck cardSized',

        events: {
            'click': 'click'
        },

        initialize: function () {
            var holder;

            //create reference back to gameView
            this.gameView = this.options.gameView;

            //create field-view
            //this view and the holder contained within share the same model
            holder = new HolderView({ model: this.model });
            holder.$el.appendTo(this.$el);
            holder.$el.append('<div class="cardBack"><div class="text">card</div></div>');
            this.$el.append('<div class="text">card</div>');

            //listen for change in poplock
            this.model.on('change:popLock', function () {
                this.updatePopLock();
            }, this);

            this.render();
        },

        render: function () {},

        remove: function () {
            //call inherited function
            Backbone.View.prototype.remove.call(this);

            //remove callbacks
            this.model.off(null, null, this);
        },

        click: function () {
            //if deck is empty, set the flipped class to prepare the flip effect
            if (this.$el.find('.card').length === 0) {
                this.$el.addClass('flipped');
            }

            //always perform pop-action (no overruling game-logic from view)
            this.model.pop();

            //remove flipped class to do reveal-effect. If a card is already
            //present, there is no flipped class present and nothing happens
            this.$el.removeClass('flipped');
        },

        updatePopLock: function () {
            var popLock = this.model.get('popLock');
            if (popLock) {
                this.$el.removeClass('popable');
            }
            else {
                this.$el.addClass('popable');
            }
        }

    });
});