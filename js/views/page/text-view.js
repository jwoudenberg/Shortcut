// --- TEXT VIEW ---
//an html text placed on top of some box, fading out that content
//needs to be supplied with an html option at creation

define(['backbone'],
function (Backbone) {
    return Backbone.View.extend({

        tagname:    'div',
        className:  'textScreen',

        initialize: function (options) {
            var html = options.html;
            if (html) {
                this.render(options.html);
            }
            else {
                throw new Error ("Text View: Text View was given no html to display.")
            }
        },

        events: {
            'click button[name=close]': 'remove'
        },

        render: function (html) {
            //prepend the faded background div and a close button
            this.$el.html(html).prepend('<div class="background" /><button name="close">close</button>');
        }

    });
});