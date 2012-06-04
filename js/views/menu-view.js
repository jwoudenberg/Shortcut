// --- MENU VIEW ---
//the menu screen

define(['backbone', 'mustache', 'text!templates/menu.mustache'],
function (Backbone, Mustache, menuTemplate) {
    return Backbone.View.extend({

        tagName: 'div',

        initialize: function () {
            this.render();
        },

        events: {
            'click #backButton': function () { location.reload(); },

            'click #ruleButton': function () {
                $('#ruleBox').removeClass('hidden');
            },

            'click #ruleCloseButton': function () {
                $('#ruleBox').addClass('hidden');
            }
        },

        render: function () {
            var html = Mustache.render(menuTemplate, {});
            this.$el.html(html).appendTo('#content');
        }

    });
});