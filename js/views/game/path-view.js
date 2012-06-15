// --- PATH VIEW ---
/* Renders a single path, by finding right path shape and rotation from the
   start and end port. Is always part of a card. */

define(['jquery', 'backbone', 'text!svg/path0.svg', 'text!svg/path1.svg',
    'text!svg/path2.svg', 'text!svg/path3.svg', 'text!svg/path4.svg',
    'text!svg/path5.svg', 'text!svg/path7.svg'],
function ($, Backbone, path0Svg, path1Svg, path2Svg, path3Svg, path4Svg,
    path5Svg, path7Svg) {
    return Backbone.View.extend({

        tagName:    'div',
        className:  'path',

        pathSvgs: [path0Svg, path1Svg, path2Svg, path3Svg, path4Svg, path5Svg,
            '', path7Svg],

        initialize: function () {
            this.$el.attr({ 'data-cid': this.model.cid });

            this.model.on('highlight', function (color) {
                this.highlight(color);
            }, this);
            this.model.on('end', this.remove, this);

            this.render();
        },

        render: function () {
            var ports = [this.model.get('start'), this.model.get('end')],
                distance,
                start,
                rotation,
                mirrored,
                transform;

            //in case of a dead end, set the end port equal to the start port
            if (ports[1] === 'unconnected') {
                ports[1] = ports[0];
            }

            //a path is defined by its starting port and
            //the distance it covers clockwise from start to end port
            distance = Math.abs(ports[0] - ports[1]);

            //we can go A->B or B->A. pick the shortest route (avoids trouble)
            if (distance <= 4) { //this is the shortest route
                //small portnumber is starting point
                start = Math.min(ports[0], ports[1]);
            } else { //the distance is larger then 4, the other route is shorter
                distance = 8 - distance; //distance of the new route
                //larg portnumber is starting point
                start = Math.max(ports[0], ports[1]);
            }

            //the 6 possible path shapes in the html file can be rotated and
            //mirrored to create all possible paths. Default values:
            rotation = 0;
            mirrored = false;

            //odd ports (1,3,5,7) will use mirror images of even ports (0,2,4,6)
            if ((start % 2) === 1) {
                mirrored = true;
                distance = (8 - distance) % 8; //distance of the mirrored path
                start -= 1; //make is even, so we can divide by two below

                //the 'distance 6'-path is a rotated 'distance 2'.
                if (distance === 6) {
                    distance = 2;
                    rotation += 270;
                }
            }

            //rotate path 0,1,2 or 3 turns
            rotation = (rotation - start / 2 * 90) % 360;

            //all info collected. create svg group-element attributes
            //rotation around the centre of the image (x=375, y=375)
            transform = 'rotate(' + rotation + ' 375 375)';
            if (mirrored) {
                transform += ' scale(-1 1) translate(-750 0)';
            }

            //get the right svg element, append it to the path-div and
            //give attributes to the group element within the svg
            $(this.pathSvgs[distance]).appendTo(this.$el).
                children('g').attr('transform', transform);
        },

        remove: function () {
            //call inherited function
            Backbone.View.prototype.remove.call(this);

            //remove callbacks
            this.model.off(null, null, this);
        },

        highlight: function (options) {
            var color = options.color,
                strong = options.strong;

            //set color
            if (color === 'none') {
                this.$el.removeClass('colored');
                color = '';
            }
            else if (color !== undefined) {
                this.$el.addClass('colored');
            }

            this.$el.find('.pathContainer').css({
                fill: color,
                stroke: color
            });

            //set strong
            if (strong === false) {
                this.$el.removeClass('strong');
            }
            else if (strong === true) {
                this.$el.addClass('strong');
            }

            return this;
        }

    });
});