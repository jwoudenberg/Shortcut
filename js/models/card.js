// --- CARD ---
/*  A card is the central user-controlled object in the game. It contains paths
    that connect its ports. They can be moved between holders and rotated.

    There is a bidirectional link between cards and holders. 
*/
define(['backbone', 'js/models/path'],
function (Backbone, Path) {
    return Backbone.Model.extend({

        paths: undefined,

        defaults: {
            //mandatory
            game:           undefined,
            //optional
            holder:         undefined,
            moveLock:       false,
            rotateLock:     false,
            rotation:       0
        },

        validate: function (attrs) {
            if (attrs.game === undefined) {
                throw new Error("Card: card needs game attribute.");
            }
        },

        initialize: function (attrs, options) {
            var holder, protoPaths, protoPath, i;

            //create path-collection
            this.paths = new (Backbone.Collection.extend({ model: Path }))();

            //create paths
            protoPaths = options.paths;
            if (protoPaths !== undefined) {
                for (i = protoPaths.length; i--;) {

                    //the path is either provided as an array of ports or as an
                    //object that can be handed to the path constructor directly
                    if (protoPaths[i].start === undefined) {
                        //we get an array of ports, create a protoPath
                        protoPath = {
                            start: protoPaths[i][0],
                            end: protoPaths[i][1],
                            card: this
                        };
                    }
                    else {
                        //we already have a protoPath. Add reference to card
                        protoPath = protoPaths[i];
                        protoPath.card = this;
                    }

                    //create the path
                    this.paths.add(protoPath);
                }
            }

            //put card in holder
            holder = options.holder;
            if (holder !== undefined) {
                this.move(holder, true);
            }
        },

        move: function (newHolder, overrideLocks) {
            var result, oldHolder;

            //check if card is allowed to move
            if (this.get('moveLock') && overrideLocks !== true) {
                result = 'card move-locked';
            }
            else {
                result = newHolder.checkIn(this, overrideLocks);
                if (result === true) { //attempt checkIn at holder

                    //checkIn succesful. checkout from old holder
                    oldHolder = this.get('holder');
                    if (oldHolder !== undefined) {
                        oldHolder.checkOut();
                    }
    
                    //set reference to new holder
                    this.set({ holder: newHolder });
                }
            }
            return result;
        },

        rotate: function (turns, overrideLocks) {
            var rotation = this.get('rotation'),
                result;

            //check if argument turns was supplied, if not rotate a single turn
            if (turns === undefined) {
                turns = 1;
            }

            //check if card is allowed to rotate
            if (this.get('rotateLock') && overrideLocks !== true) {
                result = 'card rotate-locked';
            }
            else {
                result = true;
                rotation = (rotation + turns) % 4; //4 rotations make a 360
                this.set({ rotation: rotation });
            }
            return result;
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
            result = this.getSoftPort(result);

            return result;
        }

    });
});