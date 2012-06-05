// --- MENU VIEW ---
//the menu screen

define(['backbone', 'js/views/page/rule-view.js', 'text!templates/menu.html'],
function (Backbone, ruleView, menuTemplate) {
    return Backbone.View.extend({

        initialize: function () {
            this.render();
        },

        events: {
            'click button[name=restart]': function () { location.reload(); },

            'click button[name=rules]': function () {
                this.ruleView.$el.show();
            }
        },

        render: function () {
            this.$el.html(menuTemplate);
            this.ruleView = new ruleView();
        }

    });
});