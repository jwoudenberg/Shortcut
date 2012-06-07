/* --- MENU VIEW ---
the menu screen holds a collection of buttons that can be added and removed
buttons consist of a name and a callback function for when the button is clicked

FUNCTIONS
addButton(name, callBack, context)  - adds a button to the menu
removebutton(name)                  - remove the button with name 'name'
*/


define(['underscore', 'backbone', 'text!templates/menu.html'],
function (_, Backbone, menuTemplate) {
    return Backbone.View.extend({

        tagName: 'div',
        //defined by initialize()
        buttons: undefined,

        initialize: function (options) {
            //create an empty object that will contain the buttonlist
            this.buttons = {};

            //add buttons handed to menuView constructor
            if (options.buttons) {
                this.addButtons(options.buttons);
                delete this.options.buttons;
            }

            this.render();
        },

        events: {
            'click button': 'onClick'
        },

        render: function () {
            this.$el.html(_.template(menuTemplate, {buttons: this.buttons}));
        },

        addButton: function (name, callBack, context) {
            if (!name || !callBack || !context) {
                throw new Error("Menu View addButton(): needs name, callback and context arguments");
            }
            this.buttons[name] = {
                callBack:   callBack,
                context:    context
            };

            //rerender menu
            this.render();
        },

        removeButton: function (name) {
            if (this.buttons[name]) {
                delete this.buttons[name];
            }

            //rerender menu
            this.render();
        },

        onClick: function (event) {
            var buttonName = $(event.target).attr('name'),
                button = this.buttons[buttonName];

            //check if button is listed (should always be the case)
            if (button) {
                button.callBack.apply(button.context);
            }
            else {
                throw new Error("Menu View: Clicked button is not recognized.");
            }
        },

        remove: function () {
            //call inherited remove function
            Backbone.View.prototype.remove.call(this);

            //sever connection via menu-callBacks to other objects
            delete this.buttons;
        }

    });
});