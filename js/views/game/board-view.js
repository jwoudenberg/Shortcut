// --- BOARD VIEW ---
/* Renders the board by creating field-views. Automatically adds itself to
   the page. */

define(['backbone', 'js/views/game/holder-view'],
function (Backbone, HolderView) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'board',

        initialize: function () {
            var fields, i, field;

            //create reference back to gameView
            this.gameView = this.options.gameView;

            //create field-views
            fields = this.model.fields;
            for (i = 0; i < fields.length; i++) {
                field = new HolderView({ model: fields.at(i) });
                field.$el.appendTo(this.$el);
            }

            //add attributes
            this.$el.attr({ 'data-cid': this.model.cid });

            this.render();
        },

        render: function () {}

    });
});