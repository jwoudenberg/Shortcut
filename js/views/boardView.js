// --- BOARD VIEW ---
define(['jquery', 'lib/backbone-min'],
function ($, Backbone) {
    return Backbone.View.extend({

        tagName: 'div',
        className: 'board',

        initialize: function () {
            this.render();
            this.$el.appendTo('#gameScreen');
        },

        render: function () {
            //print all 
            this.model.get('fields').each(function (field) {
                $('<div />').attr({
                    'class': 'holder field',
                    'data-row': field.get('row'),
                    'data-col': field.get('col')
                }).prependTo(this.$el);
            }, this);
        }

    });
});