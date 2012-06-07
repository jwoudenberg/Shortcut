/* --- MESSAGE VIEW ---

Used to present short messages to the player.

FUNCTIONS
post(content)   - Posts a single or an array of messages
clear()         - Clear all messages 

*/

define(['jquery', 'underscore', 'backbone'],
function ($, _, Backbone) {
    return Backbone.View.extend({

        initialize: function () {},

        post: function (content) {
            //check if you're getting an array of messages, or a single message
            if(Object.prototype.toString.call(content) === '[object Array]' ) {
                //post the messages one by one
                _.each(content, this.postSingleMessage, this);
            }
            else {
                this.postSingleMessage(content);
            }
        },

        postSingleMessage: function (message) {
            var item = $('<li style="height: 0;">' + message + '</li>');
            item.prependTo(this.$el);

            //effect to make the message slide into view;
            window.setTimeout(function() {
                item.removeAttr('style');
            }, 100);
            
        },

        clear: function () {
            //clears alle messages in the view
            this.$el.empty();
        }

    });
});