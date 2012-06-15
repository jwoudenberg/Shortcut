/*  --- CARD ---

    A card is the central user-controlled object in the game. It contains paths
    that connect its ports. They can be moved between holders and rotated.

    Cards are always placed in holders. The holder is responsible for card
    movement (using its checkIn(card) and checkOut() functions). Cards obtain
    a reference back to the holder (this.holder).

    STATIC AND ROTATED PORTS
    - static ports are the ports as they are saved in the pats models
    - rotated ports do not rotate with the card. They are numbered like so:
         5 4
         ___
      6 |   | 3
      7 |___| 2
      
         0 1
    If card rotation is 0, static and rotated ports have the same values

    - getStaticPort() and getRotatedPort() to go from one to the other.
    - getPaths() and follow() take and return rotated ports.
    
    All can take an optional rotation argument that allows you to find
    their result for a different rotation of this card.


    METHODS
    rotate (        number turns )
    createPath (    see: 'paths' under constructor options )
    getHardPort(    number softPort [, number rotation ] )
    getSoftPort (   number hardPort [, number rotation ] )
    getPaths (      number softPort [, number rotation ] )
    follow (        model path, number softPort [, number rotation ] )

    PROPERTIES
    paths:          collection of model Path

    ATTRIBUTES
    [holder:        model Holder    (underined) ]
    [rotation:      number          (0)         ]
    [moveLock:      bool            (false)     ]
    [rotateLock:    bool            (false)     ]

    CONSTRUCTOR OPTIONS
    game:           model Game
    [paths:         Array containging ...       (undefined) ]
                    1.  [startport, endport]
                    2.  model Path constructor object
*/
define(['underscore', 'backbone', 'js/models/path'],
function (_, Backbone, Path) {
    return Backbone.Model.extend({

        game: undefined,
        paths: undefined,

        defaults: {
            holder:         undefined,
            rotation:       0,
            moveLock:       false,
            rotateLock:     false
        },

        flags: {}, //to be overwritten in initialize()

        initialize: function (attrs, options) {
            var protoPaths;

            //check for and set reference to game
            if (!options.game) throw new Error("Card: card needs reference to game.");

            //set reference back to game
            this.game = options.game;

            //create flags object
            this.flags = {};

            //create path-collection
            this.paths = new (Backbone.Collection.extend({ model: Path }))();

            //create paths
            protoPaths = options.paths;
            if (protoPaths !== undefined) {
                _.forEach(protoPaths, this.createPath, this);
            }

            //check rotation
            this.set('rotation', attrs.rotation % 4);
        },

        validate: function (attrs) {
            var holder = attrs.holder,
                rotation = attrs.rotation;

            //card movement
            if (holder !== this.get('holder') && holder !== undefined) {
                //if either lock is active, that is enough
                if (this.get('moveLock') === true  || this.flags.holder) {
                    return new Error("Cannot move card: card move-locked.");
                }
                if (holder.get('acceptLock') === true) {
                    return new Error("Cannot move card: holder locked.");       
                }
                if (holder.card() !== undefined) {
                    return new Error("Cannot move card: holder occupied.");
                }
            }

            //card rotation
            if (rotation !== this.get('rotation')) {
                //if either lock is set, do not rotate
                if (this.get('rotateLock') === true  || this.flags.rotation) {
                    return new Error("Cannot rotate card: card rotate-locked.");
                }
            }
        },

        rotate: function (turns, options) {
            var rotation = this.get('rotation');

            //check if argument turns was supplied, if not rotate a single turn
            if (turns === undefined) {
                turns = 1;
            }

            rotation = (rotation + turns) % 4; //4 rotations make a 360
            this.set({ rotation: rotation }, options);

            return this;
        },

        end: function () {
            this.trigger('end');

            //end paths
            this.paths.forEach(function (path) {
                path.end();
            }, this);

            //delete references
            delete this.game;
            delete this.paths;
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

        getStaticPort: function (rotPort, rotation) {
            rotation = rotation || this.get('rotation');
            if (rotPort === 'unconnected') return rotPort;
            else {
                return ( rotPort + (2 * rotation) ) % 8;
            }
        },
        getRotatedPort: function (statPort, rotation) {
            rotation = rotation || this.get('rotation');
            if (statPort === 'unconnected') return statPort;
            else {
                return ( statPort + (6 * rotation ) ) % 8;
            }
        },

        getPaths: function (rotPort, rotation) {
        //returns paths connected to a port
            var statPort;

            //compensate for rotation of card
            statPort = this.getStaticPort(rotPort, rotation);

            return this.paths.filter(function (path) {
                //iterator for the filter function
                return (path.get('start') === statPort || path.get('end') === statPort);
            });
        },

        follow: function (path, rotPort, rotation) {
            var result, statPort;

            //compensate for rotation of card
            statPort = this.getStaticPort(rotPort, rotation);

            if (statPort === path.get('start')) {
                result = path.get('end');
            }
            else if (statPort === path.get('end')) {
                result = path.get('start');
            }
            else {
                //this port is neither begin nor end port of path
                throw new Error("Path follow(): This path does not connect to that port");
            }

            //compensate back
            return this.getRotatedPort(result, rotation);
        }

    }, {
        //CLASS PROPERTIES

        //these functions can properly compare two values for the same attribute
        //when ordinary comparison could fail
        compare: {
            holder: function (holder1, holder2) {
                //the holder-attribute contains a model. Use cids to compare.
                if (holder1 && holder2 && holder1.cid === holder2.cid) return true;
                if (holder1 === undefined && holder2 === undefined) return true;
            },

            rotation: (function () {
                var hashPath;

                hashPath = function (port1, port2) {
                    //turn an unconnected port into a port 8 (number not used)
                    if (port1 === 'unconnected') port1 = 8;
                    if (port2 === 'unconnected') port2 = 8;

                    //the following creates a unique number for each path
                    if (port1 < port2)  return port1 * 9 + port2;
                    else                return port2 * 9 + port1;
                };

                return function (rot1, rot2, model) {
                    //because some cards look the same for different rotations
                    if (rot1 === rot2) return true; //trivial case
    
                    /*  method:
                        1.  rotate each path's ports twice (rot1, rot2)
                        2.  combine ports to a hash-number
                        3.  compare lists of hash-numbers for both sets of paths
                            if they are the same: succes!
                    */
                    var rots = {}, start, end, tStart, tEnd;
                    rots[rot1] = [];
                    rots[rot2] = [];
    
                    model.paths.forEach(function (path) {
                        start = path.get('start');
                        end = path.get('end');
    
                        for (var rot in rots) {
                            //get transformed values
                            tStart = this.getRotatedPort(start, rot);
                            tEnd = this.getRotatedPort(end, rot);
                            //get the hash of the rotated path
                            rots[rot].push(hashPath(tStart, tEnd));
                        }
                    }, model);
    
    
                    //check if both path-arrays ended up the same
                    if (!_.difference(rots[rot1], rots[rot2]).length) return true;
                };
            }())
        }
    });
});