// --- RULE VIEW ---
//a page displaying the game rules

define(['backbone', 'text!templates/rules.html'],
function (Backbone, ruleTemplate) {
    return Backbone.View.extend({

        tagname:    'div',
        id:         'rules',

        initialize: function () {
            this.render();
        },

        events: {
            'click button[name=close]': function () {
                this.$el.hide();
            }
        },

        render: function () {
            this.$el.html(ruleTemplate).hide().appendTo('#content');
        }

    });
});