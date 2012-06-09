/*  --- CARD ---

    A card is the central user-controlled object in the game. It contains paths
    that connect its ports. They can be moved between holders and rotated.

    Cards are always placed in holders. The holder is responsible for card
    movement (using its checkIn(card) and checkOut() functions). Cards obtain
    a reference back to the holder (this.holder).

    METHODS
    createPath (    see: 'paths' under constructor options )
    rotate (        number turns [, bool overrideLocks] )
    getHardPort(    number softPort )
    getSoftPort (   number hardPort )
    getPaths (      number softPort )
    follow (        model path, number softPort )

    PROPERTIES
    paths:          collection of model Path
    holder:         model Holder

    ATTRIBUTES
    [rotation:      number      (0)     ]
    [moveLock:      bool        (false) ]
    [rotateLock:    bool        (false) ]

    CONSTRUCTOR OPTIONS
    game:           model Game
    [paths:         Array containging ...       (undefined) ]
                    1.  [startport, endport]
                    2.  model Path constructor object
    [holder:        model Holder                (undefined) ]
*/
define(['underscore', 'backbone', 'js/models/path'],
function (_, Backbone, Path) {
    return Backbone.Model.extend({

        game: undefined,
        paths: undefined,
        holder: undefined, //cached reference back to holder, set by holder

        defaults: {
            rotation:       0,
            moveLock:       false,
            rotateLock:     false
        },

        initialize: function (attrs, options) {
            var holder, protoPaths, protoPath, i, path;

            //check for and set reference to game
            if (!options.game) {
                throw new Error("Card: card needs reference to game.");
            }
            this.game = options.game;

            //create path-collection
            this.paths = new (Backbone.Collection.extend({ model: Path }))();

            //create paths
            protoPaths = options.paths;
            if (protoPaths !== undefined) {
                _.forEach(protoPaths, this.createPath, this);
            }

            //check rotation
            this.set('rotation', attrs.rotation % 4);

            //put card in holder
            holder = options.holder;
            if (holder !== undefined) {
                holder.checkIn(this, true); //move to holder
            }
        },

        end: function () {
            //end paths
            this.paths.forEach(function (path) {
                path.end();
            }, this);

            //delete references
            delete this.game;
            delete this.paths;
            delete this.holder;
        },

        createPath: function (input) {
            var options = { card: this }, 
                attrs, path;

            //options is either a an array of ports or an object with options
            if (Object.prototype.toString.call(input) === '[object Array]') {
                //it's an array of ports
                attrs = {
                    start:  input[0],
                    end:    input[1]
                };
            }
            else {
                //it's an object with options
                attrs= {};
                //check if an owner was provided
                if (input.owner) {
                    options.owner = input.owner;
                    delete input.owner;
                }
                attrs = input;
            }
                path = new Path(attrs, options);
                this.paths.add(path);
        },

        rotate: function (turns, overrideLocks) {
            var rotation = this.get('rotation');

            //check if argument turns was supplied, if not rotate a single turn
            if (turns === undefined) {
                turns = 1;
            }

            //check if card is allowed to rotate
            if (this.get('rotateLock') && overrideLocks !== true) {
                return 'card rotate-locked';
            }
            else {
                rotation = (rotation + turns) % 4; //4 rotations make a 360
                this.set({ rotation: rotation });
                return true;
            }
        },

        //hardPorts are the ports saved in the paths model. They do not change
        //upon card rotation. Softports are ports that account for card rotation
        getHardPort: function (softPort) {
            if (softPort === 'unconnected') {
                return softPort;
            }
            else {
                return ( softPort + (2 * this.get('rotation')) ) % 8;
            }
        },
        getSoftPort: function (hardPort) {
            if (hardPort === 'unconnected') {
                return hardPort;
            }
            else {
                return ( hardPort + (6 * this.get('rotation')) ) % 8;
            }
        },

        getPaths: function (softPort) {
        //returns paths connected to a port
            var hardPort;

            //compensate for rotation of card
            hardPort = this.getHardPort(softPort);

            return this.paths.filter(function (path) {
                return (path.get('start') === hardPort || path.get('end') === hardPort);
            });
        },

        follow: function (path, softPort) {
            var result, hardPort;

            //compensate for rotation of card
            hardPort = this.getHardPort(softPort);

            if (hardPort === path.get('start')) {
                result = path.get('end');
            }
            else if (hardPort === path.get('end')) {
                result = path.get('start');
            }
            else {
                //this port is neither begin nor end port of path
                throw new Error("Path follow(): This path does not connect to that port");
            }

            //compensate back
            return this.getSoftPort(result);
        }

    });
});