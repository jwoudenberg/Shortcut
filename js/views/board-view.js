// --- BOARD VIEW ---
/* Renders the board by creating field-views. Automatically adds itself to
   the page. */

define(['backbone', 'js/views/holder-view'],
function (Backbone, HolderView) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'board',

        initialize: function () {
            var fields, i, field;

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

        render: function () {
            //NOTE: I should consider giving the render command manually,
            //to be able to prepare the board before showing it.
            this.$el.appendTo('#content');
        }

    });
});