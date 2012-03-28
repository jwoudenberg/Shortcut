define(['action', 'event'], function (newAction, newEvent) {
    //OBJECT OVERVIEW:
    // shrtct
    // - action
    // - event
    // - shrtct.element
    //   - shrtct.board
    //   - shrtct.holder
    //     - shrtct.field
    //     - shrtct.deck
    //   - shrtct.card (alternative: shrtct.randCard)
    //   - shrtct.path

    // --- SHRTCT OBJECT ---
    //global that contains the rest of the program
    var shrtct = {};

    // --- ELEMENT ---

    //constructs a generic object and saves it in shrtct
    //[opt]type: the type of element (board, card, ...). Default: untyped
    shrtct.element = (function () {
        var lastId = 0;

        return function () {
            var that = {},
                id = lastId++;

            that.getID = function () {
                return id;
            };

            return that;
        };
    })();

    // --- BOARD ---

    //extends a jquery object representing the board
    //[man]spec.width:   width of the board
    //[man]spec.height:  height of the board
    shrtct.board = newAction(function (spec) {
        var that,
            init,
            getWidth,
            getHeight,
            getField,
            createField,
            createBounds,
            walk;

        //create a generic element to be extended
        that = shrtct.element('board');

        //INIT [private]
        init = function () {
            return that;
        };//INIT

        //GET WIDTH [public]
        that.getWidth = getWidth = (function () {
            var width = spec.width;
            return function () {
                return width;
            };
        })();//GET WIDTH

        //GET HEIGHT [public]
        that.getHeight = getHeight = (function () {
            var height = spec.height;
            return function () {
                return height;
            };
        })();//GET HEIGHT

        //CREATE FIELD [private]
        //creates a field at specific coordinates
        createField = function (row, col) {
            //spec object will be handed to field constructor
            var field,
                spec = {'board': that};

            //STEP
            //provide field with step(), which returns an adjacent field.
            spec.step = (function () {
                //to get adj. field, a field needs its coordinates and board
                //providing those in a closure prevents accidental tampering
                var x = row,
                    y = col;

                return function (direction) {
                    var nextField;

                    switch (direction) {
                        case 'up':
                            nextField = getField(x-1,y);
                            break;
                        case 'right':
                            nextField = getField(x,y+1);
                            break;
                        case 'down':
                            nextField = getField(x+1,y);
                            break;
                        case 'left':
                            nextField = getField(x,y-1);
                            break;
                        default:
                            throw new Error('board.createField: Invalid direction');
                    }

                    return nextField;
                };
            })();//STEP

            field = shrtct.field(spec); //create field
            return field;
        };//CREATE FIELD

        //GET FIELD [public]
        //returns the field at specific coordinates
        that.getField = getField = (function () {
            var fields = [],
                width = getWidth(),
                height = getHeight(),
                i,
                j;

            //create fields
            for (i = height; i--;) { //loop over all rows
                fields[i] = [];
                for (j = width; j--;) { //loop over all collumns
                    fields[i][j] = createField(i, j);
                }
            }

            //field-seeking function
            return function (x, y) {
                var width = getWidth(),
                    height = getHeight(),
                    field;

                //check whether coordinates fall outside the bord
                if (x >= height || x < 0 || y >= width || y < 0) {
                    field = undefined;
                }
                else {
                    field = fields[x][y];
                }

                return field;
            };
        })();//GET FIELD

        //CREATE BOUNDS [public]
        //creates cards to form a ring on the outermost fields. include bases
        that.createBounds = createBounds = function (players) {
            var width = getWidth(),
                height = getHeight(),
                curField = getField(0, 1),
                directions = ['right', 'down', 'left', 'up'],
                fieldsLeft = 2 * (width + height - 4), //don't count corners,
                basesLeft = 2 * players.length, //two bases a player
                dir = 0,
                corner,
                i,
                ratio = basesLeft / fieldsLeft,
                createBoundCard,
                nextField;

            createBoundCard = function () {
                var spec = {
                        holder: curField,
                        paths: [[1, 2]],
                        rotate: dir,
                        rotateable: 'disable',
                        moveable:'disable'
                    },
                    player,
                    base;

                if (!corner) {
                    spec.paths.push([0, 7]);

                    if (basesLeft / fieldsLeft > ratio) {
                        //place a base
                        player = players[basesLeft % players.length];
                        base = {
                            'player': player
                        };
                        basesLeft -= 1;

                        //randomly choose a port to connect the base-path to
                        if (Math.floor(Math.random() * 2) === 0) {
                            spec.paths[2] = [0, base];

                        }
                        else {
                            spec.paths[2] = [1, base];
                        }
                    }
                }

                shrtct.card(spec);
            };

            //check whether board is big enough for this to make sense
            if (height > 2 && width > 2) {
                for (i = 2 * (width + height - 2); i--;) {
                    nextField = curField.step(directions[dir]);
                    if (nextField === undefined) {//turn a corner
                        //change direction and recalculate the next field
                        dir = (dir + 1) % 4;
                        nextField = curField.step(directions[dir]);
                        corner = true;
                    }
                    else {//straight ahead!
                        fieldsLeft -= 1;
                        corner = false;
                    }
                    createBoundCard();
                    curField = nextField; //do step
                }
            }
            return that;
        };//CREATE BOUNDS

        //WALK [public]
        //create a route object on this board
        that.walk = walk = function (field, port) {
            return shrtct.route(that, field, port);
        };//WALK

        return init();
    });//BOARD



    // --- HOLDER ---

    //An element that holds card. Needs extension to become truly usefull
    //[opt]spec.defDrop: Whether holder is droppable. 'enabled' / 'disabled'
    //[opt]spec.type:    Type of element (field, deck). Default: untyped
    shrtct.holder = function(spec) {
        var that,
            curCard,
            init;

        //create a generic element to be extended
        that = shrtct.element('holder ' + spec.type);

        //INIT [private]
        init = function () {
            return that;
        };

        //GET CARD [public]
        that.getCard = function () {
            return curCard;
        };

        //CHECK IN [public] [action-function]
        //called by card that wants to move here
        that.checkIn = (function () {
            var action;

            action = newAction(function (newCard) {
                curCard = newCard; //save link to card
                action.disable(); //holder no longer droppable

                return function () {
                    //a function the card can use to check out again
                    curCard = undefined;
                    action.reset(); //set back to default state
                };

            }, spec.defDrop);

            return action;
        })();//CHECK IN

        return init();
    };//HOLDER



    // --- FIELD --- [inherits from holder]

    //[man]spec.step(): can be used to navigate to adjecent fields
    shrtct.field = newAction(function (spec) {
        var that,
            init,
            step;

        //create a gneric element to be extended
        that = shrtct.holder({
            type: 'field',
            defDrop: 'enable'
        });

        //INIT [private]
        init = function ()  {
            //store reference to board
            that.board = spec.board;

            return that;
        };//INIT

        //STEP [public]
        //returns adjacent field. see shrtct.board for more details
        //Use: step(<direction>), <direction> = 'up'|'right'|'down'|'left'
        that.step = step = spec.step;

        return init();
    });//FIELD



    // --- DECK --- [inherits from holder]

    //puts new cards on the screen
    shrtct.deck = newAction(function () {
        var that,
            init,
            pop;

        //create a new generic element to be extended
        that = shrtct.holder({
            type: 'deck',
            defDrop: 'disable'
        });

        //INIT [private]
        //called (below) to run once when deck is created
        init = function () {
            return that;
        };//INIT

        //POP CARD [public]
        //pop a new card with a reveal-effect
        that.pop = pop = newAction(function () {
            var newCard, value;

            //check whether the deck already contains a card
            if (that.getCard() === undefined) {
                that.checkIn.enable();
                newCard =  shrtct.randCard(that);
                that.checkIn.disable();
            }

            if (newCard === undefined) {
                value = false;
            } else {
                value = newCard;
            }

            return value;
        });//POP CARD

        return init();
    });//DECK



    // --- CARD ---

    //create a new card, place it in 'field' and give it 'paths'
    //[man]spec.holder: holder in which the card will be placed
    //[opt]spec.paths:  array of paths to create in card
    //[opt]spec.rotate: amount of turns new card is rotated (clockwise)
    //[opt]spec.text:   text to display in the card. Default: no text
    //[opt]spec.moveable:   whether card is moveable: enable (def) or disable
    //[opt]spec.rotateable: whether card van be rotated: enable (def) or disable
    shrtct.card = newAction(function (spec) {
        //Paths connect two of 8 ports, numbered like below.
        //     54
        //     --
        //  6 |  | 3
        //  7 |  | 2
        //     --
        //     01
        var paths = [],
            that,
            curHolder,
            init,
            move,
            rotate,
            getHolder,
            getPathEnds,
            addBase;

        //create a generic element to be extended
        that = shrtct.element('card');
        that.paths = paths;

        //INIT [private]
        //called (below) to run once when card is created
        init = function () {
            var i, path;

            //create paths
            for (i = spec.paths.length; i--;) {
                path = paths[i] = shrtct.path({
                    ports: spec.paths[i]
                });

                //if this path contains a base
                if (path.base) {
                    addBase(path);
                }
            }

            if (spec.holder === undefined) {
                throw new Error("shrtct.card: card holder not specified");
            }

            move.enable();
            move(spec.holder); //places card in DOM
            move.reset();

            //set starting rotation (if none is provided, that's ok)
            if (spec.rotate !== undefined) {
                rotate(spec.rotate);
            }

            return that;
        };//INIT;

        //MOVE [public]
        //private move function wrapped in action object
        that.move = move = (function () {
            //when checking in, holder returns a function checkOut() for later
            var checkOut;

            return newAction(function (holder) {
                var attempt, value;

                attempt = holder.checkIn(that);

                if (attempt) { //card is accepted
                    //check out of current holder (if checked in)
                    if(checkOut) {
                        checkOut();
                    }
                    checkOut = attempt; //bind new checkOut function
                    curHolder = holder; //set reference to new holder
                    value = true;
                }
                else {
                    value = false;
                }

                return value;
            }, spec.moveable);
        })();//MOVE

        //ROTATE [private]
        //1 argument: can be a number (turn increment) or 'smooth' (rot. eff.)
        rotate = function (argument) {
            var turns, i;

            //adds newTurns (or 1 if it is not provided) to turns
            if (typeof argument === 'number') {
                turns = argument;
            } else {
                turns = 1;
            }

            //Shift start and exit-port of all paths two places per turn
            for (i = paths.length; i--;) {
                paths[i].ports[0] = (paths[i].ports[0] + 6 * turns) % 8;
                if (typeof paths[i].ports[1] === 'number') {
                    paths[i].ports[1] = (paths[i].ports[1] + 6 * turns) % 8;
                }
            }

            return true;
        };//ROTATE [private]

        //ROTATE [public]
        //private rotate function wrapped in an action object
        that.rotate = (function () {
            var action;

            //create action object
            action = newAction(rotate, spec.rotateable);

            //bind event handlers
            action.enable.bind(function () {that.front.addClass('rotateable'); });
            action.disable.bind(function () {that.front.removeClass('rotateable'); });

            return action;
        })();//ROTATE

        //GET HOLDER [public]
        that.getHolder = getHolder = function () {
            return curHolder;
        };//GET HOLDER

        //GET PATH-ENDS [public]
        //takes a port, returns the paths and end-ports that connect to it
        that.getPathEnds = getPathEnds = (function () {
            var cache = []; //memoization

            //register event handler for rotation event (cache will be cleared)
            rotate.bind(function (){
                cache = [];
            });

            return function (startPort) {
                //ends is an array of end-objects
                //these have a path and (exit)port property
                var i, ends;

                if (cache[startPort] !== undefined) { //solution is in cache
                    ends = cache[startPort];
                } else {  //solution isn't in cash yet
                    ends = [];

                    //loop over all paths
                    for (i = paths.length; i--;) {

                        //check whether either port of the path is our startPort
                        //if so: add it to the ends-array
                        if (paths[i].ports[0] === startPort) {
                            ends.push({
                                card: that,
                                path: paths[i],
                                port: paths[i].ports[1]
                            });
                        } else if (paths[i].ports[1] === startPort) {
                            ends.push({
                                card: that,
                                path: paths[i],
                                port: paths[i].ports[0]
                            });
                        }
                    }

                    //save solution to cache
                    cache[startPort] = ends;
                }
                return ends;
            };
        })();

        //ADD BASE
        //adds a base to a specific path
        that.addBase = addBase = function (path) {
            var route;
            that.front.append('<div class="text">' + path.base.player +
                '</div>');
            that.front.click(function () {
                if (!route || !route.alive) {
                    route = shrtct.route(curHolder, that, path);
                }
                route.setColor('blue');
            });

            return that;
        };//ADD BASE

        return init();
    });//CARD



    // --- PATH ---

    //takes an ID and a route (array containing start and end point).
    //[man]spec.ports: the two ports this path connects
    shrtct.path = newAction(function (spec) {
        var ports = spec.ports.slice(0), //save a copy of the ports
            that,
            init,
            setColor;

        //create a generic element to be extended
        that = shrtct.element('path');
        that.ports = ports;

        //INIT [private]
        init = function () {
            return that;
        };//INIT

        //SET COLOR
        //sets a color for this path
        that.setColor = setColor = function (color) {
            var container = that.front.find('.pathContainer');
            container.css({
                fill: color,
                stroke: color
            }).addClass('colored');
        };

        return init();
    });//PATH



    // --- RANDOM CARD ---

    //create a unique card. no need to specify paths (unlike shrtct.card)
    shrtct.randCard = (function () {
        //all unique cards (cards that cannot be rotated into each other)
        //the more symmetries a card has, the lower its probability
        var types = [
                {paths: [[0, 7], [1, 2], [3, 4], [5, 6]], prob: 1},
                {paths: [[0, 7], [1, 2], [3, 5], [4, 6]], prob: 3},
                {paths: [[0, 7], [1, 2], [3, 6], [4, 5]], prob: 3},
                {paths: [[0, 7], [1, 3], [2, 5], [4, 6]], prob: 3},
                {paths: [[0, 7], [1, 3], [2, 6], [4, 5]], prob: 4},
                {paths: [[0, 7], [1, 4], [2, 5], [3, 6]], prob: 3},
                {paths: [[0, 7], [1, 4], [2, 6], [3, 5]], prob: 4},
                {paths: [[0, 7], [1, 5], [2, 3], [4, 6]], prob: 4},
                {paths: [[0, 7], [1, 5], [2, 4], [3, 6]], prob: 4},
                {paths: [[0, 7], [1, 5], [2, 6], [3, 4]], prob: 2},
                {paths: [[0, 7], [1, 6], [2, 3], [4, 5]], prob: 3},
                {paths: [[0, 7], [1, 6], [2, 4], [3, 5]], prob: 3},
                {paths: [[0, 7], [1, 6], [2, 5], [3, 4]], prob: 2},
                {paths: [[0, 6], [1, 3], [2, 4], [5, 7]], prob: 2},
                {paths: [[0, 6], [1, 3], [2, 5], [4, 7]], prob: 3},
                {paths: [[0, 6], [1, 3], [2, 7], [4, 5]], prob: 3},
                {paths: [[0, 6], [1, 4], [2, 3], [5, 7]], prob: 3},
                {paths: [[0, 6], [1, 4], [2, 5], [3, 7]], prob: 4},
                {paths: [[0, 6], [1, 4], [2, 7], [3, 5]], prob: 3},
                {paths: [[0, 6], [1, 5], [2, 3], [4, 7]], prob: 4},
                {paths: [[0, 6], [1, 5], [2, 4], [3, 7]], prob: 3},
                {paths: [[0, 6], [1, 7], [2, 3], [4, 5]], prob: 3},
                {paths: [[0, 6], [1, 7], [2, 4], [3, 5]], prob: 2},
                {paths: [[0, 5], [1, 3], [2, 6], [4, 7]], prob: 4},
                {paths: [[0, 5], [1, 4], [2, 3], [6, 7]], prob: 2},
                {paths: [[0, 5], [1, 4], [2, 6], [3, 7]], prob: 2},
                {paths: [[0, 5], [1, 4], [2, 7], [3, 6]], prob: 1},
                {paths: [[0, 5], [1, 6], [2, 3], [4, 7]], prob: 3},
                {paths: [[0, 4], [1, 3], [2, 5], [6, 7]], prob: 4},
                {paths: [[0, 4], [1, 3], [2, 6], [5, 7]], prob: 3},
                {paths: [[0, 4], [1, 5], [2, 3], [6, 7]], prob: 2},
                {paths: [[0, 4], [1, 5], [2, 6], [3, 7]], prob: 1},
                {paths: [[0, 3], [1, 5], [2, 6], [4, 7]], prob: 2},
                {paths: [[0, 3], [1, 6], [2, 5], [4, 7]], prob: 1},
                {paths: [[0, 1], [2, 3], [4, 5], [6, 7]], prob: 1}
            ],
            probSum = 0,
            i;
        //Convert rough probabilities (1-4) into 'real' relative probs.
        //Sum all probs as preperation for tower sampling.
        for (i = 0; i < types.length; i += 1) {
            //this probability modifies was found by experimenting
            types[i].prob = Math.pow(types[i].prob, 1.2);
            probSum += types[i].prob;
        }
        return function (holder) {
            //tower sampling: pick a random value between 0 and probSum
            var rand = Math.random()*probSum,
                i = 0;
            //loop over types subtracting probs until random turns negative
            do {
                rand -= types[i].prob;
                i += 1;
            } while (rand > 0);
            //we have now overshot our chosen type by one, se we use i-1
            return shrtct.card({
                'paths': types[i-1].paths.slice(0), //return copy of paths-array
                'rotate': Math.floor(Math.random()*4),
                'holder': holder
            });
        };
    }());//RANDOM CARD



    // --- ROUTE ---

    //takes a starting port and field, returns the entire connected route
    shrtct.route = (function () {
        //init lookup-tables: exit-port to step direction and entrance-port
        var cardLookup = ['down', 'down', 'right', 'right',
            'up', 'up', 'left', 'left'],
            portLookup = [5, 4, 7, 6, 1, 0, 3, 2],
            curColored;

        return function (field, card, path) {
            var that,
                board = field.board,
                colored = false,
                init,
                destruct,
                setColor,
                step,
                ends = [],
                alive = true,
                resets = newEvent();

            that = {};

            //INIT
            init = function () {
                var i;

                //check if this holder is on a board (might be a deck)
                if (board) {
                    //add path itself as an end
                    ends.push({
                        'card': card,
                        'path': path,
                        'port': path.ports[0],
                        'flag': true
                    });
                    card.flag = true;

                    //find all ends (recursive function)
                    step(board, ends, resets, field.step(cardLookup[path.ports[0]]),
                        portLookup[path.ports[0]]);

                    //check if this path contains any paths at all
                    if (ends.length > 0) {
                        //clean up flags
                        for (i = ends.length; i--;) {
                            if (ends[i].card.flag) {
                                ends[i].card.flag = undefined;
                            }
                            ends[i].flag = undefined;
                        }
                    }
                }
                else {
                    return undefined;
                }

                return that;
            };//INIT

            //DESTRUCT
            //function to be called when a card in route is moved or rotated
            destruct = function () {
                //reset all alternations made to this path
                resets.fire();

                ends = undefined;
                alive = false;

                return undefined;
            };//DESTRUCT

            //SET COLOR
            //color an entire route
            that.setColor = setColor = (function () {
                var i,
                    colorPaths;

                //create setColor function (no argument means no color)
                colorPaths = function (color) {

                    if (!color) {
                        color = '';
                        if (colored) {
                            colored = false;
                            curColored = undefined;
                        }
                    } else {
                        //if another route is colored, uncolor it
                        if (curColored) {
                            curColored.setColor();
                        }
                        curColored = that; //this route is colored
                        colored = true;
                    }

                    for (i = ends.length; i--;) {
                        ends[i].path.setColor(color);
                    }
                };

                //when route is destroyed, set color back (register only once)
                resets.bind(colorPaths);

                return colorPaths;
            })();//SET COLOR

            //STEP
            //this step-function calls itself recursively
            step = function (board, ends, resets, field, port) {
                var newCard,
                    newEnds,
                    i,
                    exitPort,
                    nextPort,
                    nextCard,
                    nextField;

                //check if field exists
                if (field !== undefined) {
                    newCard = field.getCard();

                    //check if card exists
                    if (newCard) {
                        newEnds = newCard.getPathEnds(port);

                        //check whether we've seen this card before
                        if (!newCard.flag) {
                            newCard.flag = true;
                            //add event handlers for when card is manilpulated
                            //add returned handler-removers to own reset-event
                            resets.bind(newCard.move.bind(destruct));
                            resets.bind(newCard.rotate.bind(destruct));
                        }

                        //loop over all newPaths
                        for (i = newEnds.length; i--;) {

                            //check wether we've been here before
                            if (newEnds[i].flag === undefined) {

                                newEnds[i].flag = true; //flag this port
                                ends.push(newEnds[i]); //add path end to route-array

                                //prepare next step
                                exitPort = newEnds[i].port;
                                nextPort = portLookup[exitPort];
                                nextCard = cardLookup[exitPort];
                                nextField = field.step(nextCard, nextPort);

                                //recursion
                                step(board, ends, resets, nextField, nextPort);

                            }
                        }

                    }
                }
            };

            return init();
        };
    }());//ROUTE

    return shrtct;
});