/* --- CARD VIEW ---

    Renders a card. The card is placed (and moved) in the DOM by the holder(s)
    that contain it.
*/
define(['jqueryui', 'backbone', 'js/views/game/path-view'],
function (jQueryUi, Backbone, PathView) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'card',
        $rotation:  0, //utility variable for rotate()

        events: {
            'mousedown':    'mousedown'
        },

        initialize: function () {
            //CARD DIV SETUP
            //set attributes
            this.$el.attr({
                'data-cid': this.model.cid
            });

            //make card draggable (uses jquery-ui)
            this.$el.draggable({
                revert: 'invalid',  //jump back if not dropped on a droppable
                revertDuration: 100,//jump back-animation
                helper: 'original'
            });

            //card state event listeners
            this.model.on('change:rotation', this.rotate, this);
            this.model.on('change:moveLock flag:holder',
                this.updateMoveLock, this);
            this.model.on('change:rotateLock flag:rotation',
                this.updateRotateLock, this);
            this.model.on('end', this.remove, this);
            this.model.paths.on('add remove change', this.render, this);

            //listen for change of path-owners
            this.model.paths.on('owner', function (path) {
                this.updateLabel(path);
            }, this);

            this.render();
        },

        render: function () {
            this.$el.detach().empty().                  //start clean
                append('<div class="text"></div>').     //add text div
                append('<div class="effect"></div>');   //add effect div

            //create path-views
            this.model.paths.each( this.createPathView, this);

            //set card properties
            this.updateMoveLock();  //set correct locked/unlocked behaviour
            this.updateRotateLock();
            this.rotate();          //give card correct rotation
        },

        remove: function () {
            //call inherited function
            Backbone.View.prototype.remove.call(this);

            //remove callbacks
            this.model.off(null, null, this);
            this.model.paths.off(null, null, this);
        },

        createPathView: function (path) {
            var pathView = new PathView({ model: path });
            pathView.$el.appendTo(this.$el);
            this.updateLabel(path);
            return pathView;
        },

        mousedown: function (event) {
        //register mousedown even handler (for rotation)
            event.stopPropagation();
            event.preventDefault();
            if (event.which === 3) { //check for right-click
                this.model.rotate();
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

        updateMoveLock: function () {
            var model = this.model,
                $el = this.$el;

            //if either lock is in place, that suffices
            if (model.flags.holder || model.get('moveLock')) {
                $el.draggable('disable');
                $el.removeClass('draggable');
            }
            else {
                $el.draggable('enable');
                $el.addClass('draggable');
            }

            return this;
        },

        updateRotateLock: function () {
            var model = this.model,
                $el = this.$el;

            //if either lock is in place, that suffices
            if (model.flags.rotation || model.get('rotateLock')) {
                $el.removeClass('rotateable');
            }
            else {
                $el.addClass('rotateable');
            }

            return this;
        },

        updateLabel: function (path) {
            var owner = path.owner;
            if (owner !== undefined) {
                this.$el.children('.text').html(owner.get('name'));
            }

            return this;
        }

    });
});