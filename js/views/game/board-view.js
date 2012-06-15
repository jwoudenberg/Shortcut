// --- BOARD VIEW ---
/* Renders the board by creating field-views. Automatically adds itself to
   the page. */

define(['backbone', 'js/views/game/holder-view'],
function (Backbone, HolderView) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'board',

        initialize: function () {
            var fields, i, field, view;

            //create field-views
            fields = this.model.fields;
            for (i = 0; i < fields.length; i++) {
                field = fields.at(i);
                //append a break at the start of a new row
                if (field.get('col') === 0) this.$el.append('<br />');
                view = new HolderView({ model: field });
                view.$el.appendTo(this.$el);
            }

            //add attributes
            this.$el.attr({ 'data-cid': this.model.cid });

            this.render();
        },

        render: function () {},

        remove: function () {
            //call inherited function
            Backbone.View.prototype.remove.call(this);

            //remove callbacks
            this.model.off(null, null, this);
        }

    });
});