(function () {"use strict";
    //OBJECT OVERVIEW:
    // shrtct
    // - shrtct.action
    // - shrtct.element
    //   - shrtct.board
    //   - shrtct.holder
    //     - shrtct.field
    //     - shrtct.deck
    //   - shrtct.card (alternative: shrtct.randCard)
    //   - shrtct.path


    // --- SHRTCT OBJECT ---
    //global that contains the rest of the program
    var shrtct = {
        elements: [] //will contain references to all interface elements (divs)
    };

    // --- ELEMENT ---
    //constructs a generic object with jQuery interace and saves it in shrtct
    //[opt]type: the type of element (board, card, ...). Default: untyped
    shrtct.element = function (type) {
        var id = shrtct.elements.length, //give unique element-id
            that = shrtct.elements[id] = {};
        if(type === undefined) {
            type = 'untyped';
        }
        //create jQyeury object as 'front' of the new element (don't add to DOM)
        that.front = $('<div class="' + type +
            '" data-shrtct="' + id + '" />');
        return that;
    };

    // --- ACTION ---
    //allows user-actions to be undertaken, enabled or disabled
    //[man]func:       function that will be called if succesfull
    //[opt]defState:   defaul state (default: enable)
    shrtct.action = function (func, defState) {
        var that,
            curState,
            init,
            state,
            enable,
            disable,
            reset;

        //ACT [public]
        //Executes function or fail-function depending on state
        that = (function () {
            var event = shrtct.event(),
                that,
                result;

            //check whether a function has been supplied
            if (func === undefined) {
                throw new Error("shrtct.action: no spec.function has been provided");
            }

            that = function () {
                if (curState === 'enable') {
                    result = func.apply(null, arguments); //perform action
                    event.fire(); //fire events
                }
                else {
                    result = false;
                }
                return result;
            };

            that.bind = event.bind;

            return that;
        })();//ACT

        init = function () {
            reset();
            return that;
        };//INIT

        //STATE [public]
        //returns the current state
        that.state = state = function () {
            return curState;
        };//STATE

        //ENABLE [public]
        //enables the action
        that.enable = enable = (function () {
            var event = shrtct.event(),
                enable;

            enable = function () {
                if (curState !== 'enable') {
                    curState = 'enable';
                    event.fire();
                }
            };
            enable.bind = event.bind;

            return enable;
        })();//ENABLE

        //DISABLE [public]
        that.disable = disable = (function () {
            var event = shrtct.event(),
                disable;

            disable = function () {
                if (curState !== 'disable') {
                    curState = 'disable';
                    event.fire();
                }
            };
            disable.bind = event.bind;

            return disable;
        })();//DISABLE

        //DEFAULT [public]
        that.reset = reset = (function () {
            var resetFunc;

            //if no defState supplied, set teh default to enable
            if (defState === undefined) {
                defState = 'enable';
            }

            if (defState === 'enable') {
                resetFunc = enable;
            } else if (defState === 'disable') {
                resetFunc = disable;
            } else {
                throw new Error("action.reset: " + defState + " is not a valid state.");
            }

            return resetFunc;
        })();//DEFAULT

        return init();
    };//ACTION

    // --- EVENT ---
    //Functions can be added to it. When fired, all coupled functions will fire
    shrtct.event = function () {
        var that,
            handlers = [],
            init,
            fire,
            bind;

        that = {};
        
        //INIT
        init = function () {
            return that;
        };//INIT

        //FIRE
        //activate all handlers
        that.fire = fire = function () {
            var i;
            for (i = handlers.length; i--;) {
                if (handlers[i].dead) {
                    handlers.splice(i, 1);
                } else {
                    handlers[i].func.apply(null, arguments);
                }
            }
            return that;
        };//FIRE

        //BIND
        //bind a new function to this event
        that.bind = bind = function (func) {
            var handler = {'func': func};

            //allows a handler to be removed again
            handler.remove = function () {
                handler.dead = true;
            };

            //add handler to the list
            handlers.push(handler);
            //return handler-remove function
            return handler.remove;
        };//BIND

        return init();
    };//EVENT

    // --- BOARD ---       
    //extends a jquery object representing the board
    //[man]spec.width:   width of the board
    //[man]spec.height:  height of the board
    //[man]spec.replace: jQuery-element that will be replaced with the board
    shrtct.board = function (spec) {
        var that,
            width = spec.width,
            height = spec.height,
            fields = [],
            init,
            print,
            createField,
            getField,
            createBounds,
            walk;

        //create a generic element to be extended
        that = shrtct.element('board');

        //INIT [private]
        init = function () {
            var i, j;
            //create fields
            for (i = 0; i < height; i += 1) { //loop over all rows
                fields[i] = [];
                for (j = 0; j < width; j += 1) { //loop over all collumns
                    createField(i, j);
                }
            }
            //place board in DOM
            print();
            return that;
        };//INIT

        //PRINT [private]
        //prints row-divs and fields inside the board-element
        print = function () {
            var i, j, row;
            for (i = 0; i < height; i += 1) { //loop over rows
                row = $('<div class="row" />').
                    appendTo(that.front);
                for (j = 0; j < width; j += 1) { //loop over field in row
                    fields[i][j].front.appendTo(row);
                }
            }
            //print to DOM
            that.front.replaceAll(spec.replace);
            return that;
        };//PRINT

        //CREATE FIELD [private]
        //creates a field at specific coordinates
        createField = function (row, col) {
            //spec object will be handed to field constructor
            var spec = {'board': that};

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

            fields[row][col] = shrtct.field(spec); //create field
            return fields[row][col];
        };//CREATE FIELD

        //GET FIELD [public]
        //returns the field at specific coordinates
        that.getField = getField = function (x, y) {
            var field;
            //check whether coordinates fall outside the bord
            if (x >= height || x < 0 || y >= width || y < 0) {
                field = undefined;
            }
            else {
                field = fields[x][y];
            }
            return field;
        };//GET FIELD

        //CREATE BOUNDS [public]
        //creates cards to form a ring on the outermost fields. include bases
        that.createBounds = createBounds = function (players) {
            //check whether board is big enough for this to make sense
            if (height > 2 && width > 2) {
                var curField = getField(0, 1),
                    directions = ['right', 'down', 'left', 'up'],
                    dir = 0,
                    i,
                    fieldsLeft = 2 * (width + height - 4), //don't count corners
                    basesLeft = 2 * players.length, //two bases a player
                    ratio = basesLeft / fieldsLeft,
                    nextField,
                    player,
                    base,
                    spec;

                for (i = 2 * (width + height - 2); i--;) {
                    nextField = curField.step(directions[dir]);
                    if (nextField === undefined) {//turn a corner
                        //change direction and recalculate the next field
                        dir = (dir + 1) % 4;
                        nextField = curField.step(directions[dir]);
                        shrtct.card({
                            holder:     curField,
                            paths:      [[1, 2]],
                            rotate:     dir,
                            rotateable: 'disable',
                            moveable:   'disable'
                        });
                    }
                    else {//straight ahead!
                        spec = {
                            holder:     curField,
                            paths:      [[0, 7], [1, 2]],
                            rotate:     dir,
                            rotateable: 'disable',
                            moveable:   'disable'
                        };

                        //check whether it's time to also build a base-path
                        fieldsLeft -= 1;
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
                        //create the card
                        shrtct.card(spec);
                    }
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
    };//BOARD

    // --- HOLDER ---
    //An element that holds card. Needs extension to become truly usefull
    //[opt]spec.defDrop: Whether holder is droppable. 'enabled' / 'disabled'
    //[opt]spec.type:    Type of element (field, deck). Default: untyped
    shrtct.holder = function(spec) {
        var that,
            curCard,
            init,
            print,
            dropped;

        //create a generic element to be extended
        that = shrtct.element('holder ' + spec.type);

        //INIT [private]
        init = function () {
            print();
            return that;
        };

        //PRINT [private]
        print = print = function () {
            //make fields droppable
            that.front.droppable({
                drop: function (event, ui) {
                    //remove positioning-css in style-attribute
                    ui.draggable.css({left: 0, top: 0});
                    //call function with dropped card as an argument
                    dropped(ui.draggable.shrtct());
                }
            });
            return that;
        };//PRINT

        //DROPPED [private]
        dropped = function (dropCard) {
            dropCard.move(that);
        };//DROPPED

        //GET CARD [public]
        that.getCard = function () {
            return curCard;
        };

        //CHECK IN [public] [action-function]
        //called by card that wants to move here
        that.checkIn = (function () {
            var action;

            action = shrtct.action(function (newCard) {
                curCard = newCard; //save link to card
                action.disable(); //holder no longer droppable

                return function () {
                    //a function the card can use to check out again
                    curCard = undefined;
                    action.reset(); //set back to default state
                };

            }, spec.defDrop);

            //create handlers for enable and disable event
            action.enable.bind(function () {that.front.droppable('enable'); });
            action.disable.bind(function () {that.front.droppable('disable'); });

            return action;
        })();//CHECK IN

        return init();
    };//HOLDER


    // --- FIELD --- [inherits from holder]
    //[man]spec.step(): can be used to navigate to adjecent fields
    shrtct.field = function (spec) {
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
    };//FIELD


    // --- DECK --- [inherits from holder]
    //puts new cards on the screen
    //[man]spec.replace: jQuery-element that will be replaced with deck
    shrtct.deck = function (spec) {
        var that,
            init,
            print,
            clicked,
            popCard;

        //create a new generic element to be extended
        that = shrtct.holder({
            type: 'deck',
            defDrop: 'disable'
        });

        //INIT [private]
        //called (below) to run once when deck is created
        init = function () {
            print();
            return that;
        };//INIT
        
        //PRINT [private]
        //called once at deck creation to create DOM-connection
        print = function () {
            that.front.replaceAll(spec.replace).
                mousedown(function (event) {
                //register mousedown even handler (for card creation)
                clicked(event);
                event.preventDefault();
            }).html('<div class="cardBack"><div class="text">card</div></div>').
                wrapInner('<div class="cardWrap" />');
            //we need an addition wrapper div for the flip effect
            that.front = that.front.children('.cardWrap');
            return that;
        };//PRINT

        //CLICKED [private]
        //called when a deck is clicked
        clicked = function (event) {
            if (event.which === 1) { //check for left-click
                popCard();
            }
        };

        //POP CARD [public]
        //pop a new card with a reveal-effect
        that.popCard = popCard = (function () {
            var action, makeCard;

            makeCard = function () {
                var newCard;
                //check whether the deck already contains a card
                if (that.getCard() === undefined) {
                    that.checkIn.enable();
                    newCard =  shrtct.randCard(that);
                    that.checkIn.disable();
                    return newCard;
                }
            };

            action = shrtct.action(function () {
                var popCard2,
                    newCard = makeCard(); //try to create a new card

                if (newCard !== undefined) { //if succes
                    action.disable(); //no new pops for the moment
                    that.front.addClass('flipped'); //do the flip-effect (CSS)

                    //set a timer to fire when the effect is finished
                    //300ms also defined in the CSS
                    setTimeout(function () {popCard2(); }, 500);

                    popCard2 = function () {
                        //new pops allowed again
                        action.enable();
                        //flip back (happens instantly)
                        that.front.removeClass('flipped');
                        //free the new card from the cardWrap-div
                        newCard.front.insertAfter(that.front);
                    };//popCard2
                }

                return that;
            });

            return action;
        })();//POP CARD

        return init();
    };//DECK

    // --- CARD ---
    //create a new card, place it in 'field' and give it 'paths'
    //[man]spec.holder: holder in which the card will be placed
    //[opt]spec.paths:  array of paths to create in card
    //[opt]spec.rotate: amount of turns new card is rotated (clockwise)
    //[opt]spec.text:   text to display in the card. Default: no text
    //[opt]spec.moveable:   whether card is moveable: enable (def) or disable
    //[opt]spec.rotateable: whether card van be rotated: enable (def) or disable
    shrtct.card = function (spec) {
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
            print,
            clicked,
            move,
            rotate,
            getPathEnds,
            addBase;

        //create a generic element to be extended
        that = shrtct.element('card');

        //INIT [private]
        //called (below) to run once when card is created
        init = function () {
            var i, path;

            //create paths
            for (i = spec.paths.length; i--;) {
                path = paths[i] = shrtct.path({
                    ports: spec.paths[i],
                    container: that.front
                });

                //if this path contains a base
                if (path.base) {
                    addBase(path);
                }
            }

            print(); //not yet in DOM, that happens with move() below
            if (spec.holder === undefined) {
                throw new Error("shrtct.card: card holder not specified");
            }

            move(spec.holder); //places card in DOM

            //set starting rotation (if none is provided, that's ok)
            if (spec.rotate !== undefined) {
                rotate(spec.rotate);
            }

            return that;
        };//INIT

        //PRINT [private]
        //called once at card creation to create DOM-connection
        print = function () {
            //rotation attribute
            that.front.attr('data-rotation',0).draggable({
                //make card draggable
                revert: 'invalid',  //jump back if not dropped on a droppable
                revertDuration: 100,//jump back-animation
                helper: 'original'
            }).mousedown(function (event) {
                //register mousedown even handler (for rotation)
                event.stopPropagation(); //
                clicked(event);
                event.preventDefault();
            });

        };//PRINT

        //CLICKED [private]
        //called when a card is clicked
        clicked = function (event) {
            if (event.which === 3) { //check for right-click
                that.rotate('smooth');
            }
        };

        //MOVE [private]
        //takes a holder and tries to move card there
        move = (function () {
            var checkOut;

            return function (holder) {
                var value;

                curHolder = holder;
                value = holder.checkIn(that);

                if (value) { //card is accepted
                    that.front.appendTo(holder.front); //move card in DOM
                    //check out of current holder (if checked in)
                    if(checkOut) {
                        checkOut();
                    }
                    checkOut = value; //bind new checkOut function
                }

                return that;
            };
        })();

        //MOVE [public]
        //private move function wrapped in action object
        that.move = (function () {
            //when checking in, holder returns a function checkOut() for later
            var action;

            action = shrtct.action(move, spec.moveable);

            //bind event handlers
            action.enable.bind(function () {
                that.front.draggable('enable');
                that.front.addClass('draggable');
            });
            action.disable.bind(function () {
                that.front.draggable('disable');
                that.front.removeClass('draggable');
            });

            return action;
        })();//MOVE

        //ROTATE [private]
        //1 argument: can be a number (turn increment) or 'smooth' (rot. eff.)
        rotate = (function () {
            var rotation = 0;

            return function (argument) {
                var turns, i;

                //adds newTurns (or 1 if it is not provided) to turns
                if (typeof argument === 'number') {
                    turns = argument;
                } else {
                    turns = 1;
                }

                //smooth or instant rotation?
                if (argument === 'smooth') { //go to smooth mode (CSS hook)
                    that.front.addClass('rotateSmooth');
                }
                else { //go to instant mode (CSS hook)
                    that.front.removeClass('rotateSmooth');    
                }

                //rotate visually (faster than reprinting all the paths)
                rotation = (rotation + turns * 90);
                that.front.css({
                    'transform':            'rotate(' + rotation + 'deg)',
                    '-moz-transform':       'rotate(' + rotation + 'deg)',
                    '-webkit-transform':    'rotate(' + rotation + 'deg)',
                    '-o-transform':         'rotate(' + rotation + 'deg)'
                });

                //Shift start and exit-port of all paths two places per turn
                for (i = paths.length; i--;) {
                    paths[i].ports[0] = (paths[i].ports[0] + 6 * turns) % 8;
                    paths[i].ports[1] = (paths[i].ports[1] + 6 * turns) % 8;
                }
            };
        })();//ROTATE [private]

        //ROTATE [public]
        //private rotate function wrapped in an action object
        that.rotate = (function () {
            var action;

            that.front.attr('data-rotation', 0);

            //create action object
            action = shrtct.action(rotate, spec.rotateable);

            //bind event handlers
            action.enable.bind(function () {that.front.addClass('rotateable'); });
            action.disable.bind(function () {that.front.removeClass('rotateable'); });

            return action;
        })();//ROTATE

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
    };//CARD

    // --- PATH ---
    //takes an ID and a route (array containing start and end point).
    //[man]spec.ports: the two ports this path connects
    shrtct.path = function (spec) {
        var ports = spec.ports.slice(0), //save a copy of the ports
            that,
            init,
            print,
            setColor;

        //create a generic element to be extended
        that = shrtct.element('path');
        that.ports = ports;

        //INIT [private]
        init = function () {
            print();
            return that;
        };//INIT

        //PRINT draws an svg path [private]
        print = function () {
            var distance,
                start,
                rotation,
                mirrored,
                transform;

            //check for one-ended paths
            if (typeof ports[1] === 'object') {
                that.base = ports[1];//make base accessible
                ports[1] = ports[0];
            }

            //a path is defined by its starting port and
            //  the distance it covers clockwise from start to end port
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
            //  mirrored to create all possible paths. Default values:
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

            //clone the right svg element, append it to the path-div and
            //give attributes to the group element within the svg
            that.front.empty(); //remove current content (if it exists)
            $('#path-' + distance).clone().removeAttr('id').
                appendTo(that.front).children('g').attr('transform', transform);

            //append path to card
            that.front.appendTo(spec.container);

            return that;
        };//PRINT

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
    };//PATH

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
                resets = shrtct.event();

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

    // === JQUERY OBJECT FUNCTIONS ===
    //finds the shrtct-element belonging to a jQuery-object
    $.fn.shrtct = function () {
        var value, //to be returned later
            test = this.attr('data-shrtct'); //all shrtct-elements have this
        if (test !== undefined) {
            value = shrtct.elements[test];
        } else {
            throw new Error("jQuery.fn.shrtct: 'this' is not a shortcut element.");
        }
        return value;
    };

    // === EXECUTE WHEN DOCUMENT IS LOADED ===
    $(document).ready(function () {
        //DISABLE CONTEXT-MENU
        $('body').bind('contextmenu', function (event) {
            return false;
        });

        $('#numPlayers').change(function () {
            var numPlayers = parseInt($('#numPlayers').attr('value'), 10),
                fields = $('#playerList').children('li'),
                numFields = parseInt(fields.length, 10),
                html,
                i;

                if (numFields < numPlayers) {
                    html = '';
                    for (i = numPlayers - numFields; i--;) {
                        html += '<li><input type="text" value="player" /></li>';
                    }
                    $('#playerList').append(html);
                } else if (numFields > numPlayers) {
                    fields.slice(numPlayers).remove();
                }
        }).trigger('change');

        $('#backButton').click(function () {
            location.reload();
        });

        $('#ruleButton').click(function () {
            $('#ruleBox').removeClass('hidden');
        });

        $('#ruleCloseButton').click(function () {
            $('#ruleBox').addClass('hidden');
        });

        $('#beginButton').click(function (){
            var board,
                players = [],
                boardSize = parseInt($('#boardSize').attr('value'), 10) + 2,
                i;

                for (i = $('#playerList').children('li').length; i--;) {
                    players.push($('#playerList').children('li:eq(' + i + ')').
                        children('input').attr('value'));
                }
            if (players.length > 2 * boardSize - 4) {
                alert("Choose less players or a bigger board size.")
            } else if (typeof boardSize < 3) {
                alert("Choose a bigger board size.");
            } else {

                $('#startScreen').addClass('hidden');
                $('#gameScreen').removeClass('hidden');

                //BUILD BOARD
                board = shrtct.board({
                    replace:   $('#board'),
                    width:      boardSize,
                    height:     boardSize
                });
                board.createBounds(players); //testcode
                //BUILD DECK
                shrtct.deck({
                    replace:    $('#deck')
                });
            }
        })
        /*
        //CREATE TEST BUTTON
        $('body').prepend('<div id="testButton" style="float: right; border: 1px solid #aaa;" >test</div>');
        $('#testButton').click(function () {

        });
        */
    });

    }());