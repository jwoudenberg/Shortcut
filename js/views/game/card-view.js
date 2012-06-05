// --- CARD VIEW ---
/* Renders a card and automatically add it to the right holder-element.

   Card-views contain a number of path-views and possibly a label (text).
   This label is used to display the name of a player owning a path on the card.
   It is assumed only a single path per card is owned. Otherwise, only one name
   will be displayed in the label.
*/

define(['jquery', 'jqueryui', 'backbone', 'js/models/route',
    'js/views/game/path-view'],
function ($, jqueryUi, Backbone, Route, PathView) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'card',

        events: {
            'mousedown':    'mousedown',
            'click':        'click'
        },

        initialize: function () {
            var paths;

            //create reference back to gameView
            this.gameView = this.options.gameView;

            // --- CARD DIV SETUP
            //set attributes
            this.$el.attr({
                'data-cid': this.model.cid
            }).append('<div class="text"></div>');

            //make card draggable (uses jquery-ui)
            this.$el.draggable({
                revert: 'invalid',  //jump back if not dropped on a droppable
                revertDuration: 100,//jump back-animation
                helper: 'original'
            });

            this.$rotation = 0; //used by rotate()

            // --- PATH-RELATED
            //create path-views
            paths = this.model.paths.each(this.createPathView, this);

            //listen for additional paths
            this.model.paths.on('add', function (path) {
                this.createPathView(path);
            }, this);

            //listen for change of path-owners
            this.model.paths.on('change:owner', function (path) {
                this.updateLabel(path);
            }, this);

            // --- CARD STATE EVENT LISTENERS
            //when a cards rotation changes, rotate card in DOM
            this.model.on('change:rotation', function () {
                this.rotate();
            }, this);

            //when a cards holder changes, move card in DOM
            this.model.on('change:holder', function () {
                this.place();
            }, this);

            //listen for change in movelock
            this.model.on('change:moveLock', function () {
                this.updateMoveLock();
            }, this);

            //listen for change in rotatelock
            this.model.on('change:moveLock', function () {
                this.updateRotateLock();
            }, this);

            this.render();
        },

        createPathView: function (path) {
            var pathView = new PathView({ model: path });
            pathView.$el.appendTo(this.$el);
            this.updateLabel(path);
            return pathView;
        },

        render: function () {
            this.updateMoveLock(); //set correct locked/unlocked behaviour
            this.updateRotateLock();
            this.rotate(); //give card correct rotation
            this.place(); //move the card element to its holder
        },

        mousedown: function (event) {
        //register mousedown even handler (for rotation)
            event.stopPropagation();
            event.preventDefault();
            if (event.which === 3) { //check for right-click
                this.model.rotate();
            }
        },

        click: function (event) {
        //if a dead-end path is presented, create a route
            var path = this.model.paths.where({ end: 'unconnected' })[0],
                goal, route;

            if (path !== undefined) {
                //find the other base of this owner; it is the goal of the route
                if (path.get('owner').bases.at(0).cid === path.cid) {
                    goal = path.get('owner').bases.at(1);
                }
                else {
                    goal = path.get('owner').bases.at(0);
                }

                route = new Route({
                    begin: path,
                    goal: goal
                });

                //trigger event for paths in route to highlight the path
                route.paths.forEach(function (path) {
                    path.trigger('highlight', 'blue');
                }, this);

                //when the route ceases to exits, remove the highlighting
                route.on('destroy', function () {
                    route.paths.forEach(function (path) {
                        path.trigger('highlight', '');
                    }, this);
                    route.off('destroy', null, this); //remove this event handler
                }, this);
            }
        },

        rotate: function () {
        //called when a card is rotated (cards will always be rotated clockwise)
            var $rotation = this.$rotation, //value currently held by card-CSS
                newRotation = this.model.get('rotation'),
                oldRotation = ($rotation % 360) / 90,
                diff;

            //calculate the amount of clockwise turns that is needed
            diff = (newRotation + 4 - oldRotation) % 4;

            //calculate new value for $rotation
            this.$rotation = $rotation += diff * 90;

            //update css
            this.$el.css({
                'transform':            'rotate(' + $rotation + 'deg)',
                '-moz-transform':       'rotate(' + $rotation + 'deg)',
                '-webkit-transform':    'rotate(' + $rotation + 'deg)',
                '-o-transform':         'rotate(' + $rotation + 'deg)'
            });

            return this;
        },

        place: function () {
        //place card in the DOM (in its current holder)
            var holder  = this.model.get('holder'),
                $holder;

            if (holder !== undefined) {
                //find holder in DOM
                $holder = this.gameView.$el.find('[data-cid=' + holder.cid + ']');

                //move dom-element card
                this.$el.appendTo($holder);
            }

            return this;
        },

        updateMoveLock: function () {
            var moveLock = this.model.get('moveLock');
            if (moveLock) {
                this.$el.draggable('disable');
                this.$el.removeClass('draggable');
            }
            else {
                this.$el.draggable('enable');
                this.$el.addClass('draggable');
            }

            return this;
        },

        updateRotateLock: function () {
            var moveLock = this.model.get('rotateLock');
            if (moveLock) {
                this.$el.removeClass('rotateable');
            }
            else {
                this.$el.addClass('rotateable');
            }

            return this;
        },

        updateLabel: function (path) {
            var owner = path.get('owner');
            if (owner !== undefined) {
                this.$el.children('.text').html(owner.get('name'));
            }

            return this;
        }

    });
});