/* --- MAIN VIEW ---

Sets up different page elements and then shows the setup screen in
the content area

FUNCTIONS
changeContentView(view) - show view in content area
setup()                 - show setup view in content area
postMessage(message)    - post a message in the messageArea
showText(text)          - show a textScreen on top of the content area
*/

define(['jquery', 'underscore', 'backbone', 'js/views/page/setup-view',
    'js/views/page/message-view', 'js/views/page/menu-view',
    'js/views/page/text-view'],
function ($, _, Backbone, SetupView, MessageView, MenuView, TextView) {
    return Backbone.View.extend({

        //future references to subviews
        contentView:    undefined,
        messageView:    undefined,
        menuView:       undefined,
        textView:       undefined,

        initialize: function () {
            this.render();

            var self = this;
            //when the window is resized, fire resize() function
            $(window).resize(function () {
                //call resize, 'this' continues to refer to this view
                self.resize.apply(self);
            });

        },

        render: function () {
            //creates all subviews. Call once.

            //set the body element as this views element
            this.setElement('body');

            //clean out content section and disable the context menu
            $('#content').empty().bind('contextmenu', function () {
                return false; //disable context menu
            });

            //creates the message area
            this.messageView = new MessageView({ el: $('#messageArea') });

            //create a menuView
            this.menuView = new MenuView({
                el: 'menu'
            });

            //show the setup screen to start
            this.setup();
        },

        remove: function () {
            //call inherited remove function
            Backbone.View.prototype.remove.call(this);

            //sever connection via menu-callBacks to other objects
            this.messageView.remove();
            this.menuView.remove();
            if (this.textView) {
                this.textView.remove();
            }
            if (this.contentView) {
                delete this.contentView.mainView;
                this.contentView.remove();
            }
        },

        changeContentView: function (newView) {
            //called to make a view populate the content (and menu) areas
            var oldView = this.contentView;

            //check if there already is a contentview
            if (oldView) {
                //remove menuOptions if they exist
                if (oldView.menuOptions) {
                    _.each(oldView.menuOptions, function (callback, name) {
                        this.removeButton(name);
                    }, this.menuView);
                }

                oldView.remove();
                oldView.mainView = undefined;
            }

            //add new view
            newView.mainView = this;
            newView.render();
            newView.$el.prependTo('#content');
            if (newView.arrange) newView.arrange(); //let view arrange itself

            //set own reference to new view
            this.contentView = newView;

            //refresh messageView
            this.messageView.clear();

            //add menuOptions if they exist
            if (newView.menuOptions) {
                _.each(newView.menuOptions, function (callback, name) {
                    this.addButton(name, callback, newView);
                }, this.menuView);
            }
        },

        resize: _.debounce(function () {
            //fire arrange function of the contentView, if it exists
            //_.debounce() returns a version of this function that waits
            if (this.contentView && this.contentView.arrange) {
                this.contentView.arrange();
            }
        }, 100),

        setup: function () {
            //displays a new setup screen
            var view = new SetupView({
                mainView: this
            });
            this.changeContentView(view);
        },

        showText: function (html) {
            //shows the provided text on top of the content area
            var textView = this.textView;
            if (textView) {
                //remove current textView
                delete textView.mainView;
                textView.remove();
            }

            //add new nextView
            textView = new TextView({ html: html });
            textView.mainView = this;
            textView.$el.appendTo('#content');

            //save reference
            this.textView = textView;

            //return the textView (for instance to bind eventhandlers)
            return textView;
        },

        postMessage: function (message) {
            //convenience wrapper function to post a message in the messageView
            this.messageView.post(message);
        }

    });
});