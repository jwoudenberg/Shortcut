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
    //[man]spec.func:       function that will be called if succesfull
    //[opt]spec.failFunc:   function that will be called if failed
    //[opt]spec.enableFunc: function that will be called if enabled
    //[opt]spec.disableFunc:function that will be called if disabled
    //[opt]spec.defState:   defaul state (default: enabled)
    shrtct.action = function (spec) {
        var that,
            func = spec.func,
            failFunc = spec.failFunc,
            enableFunc = spec.enableFunc,
            disableFunc = spec.disableFunc,
            defState = spec.defState || 'enable',
            curState,
            init,
            state;
        
        //ACT [public]
        //Executes function or fail-function depending on state
        that = function () {
            var value;
            if (curState === 'enable') {
                //this action is enabled, so execute its function
                value = func(arguments[0], arguments[1], arguments[2]);
            }
            else {
                //this action is disabled. Execute failFunc() if it exists
                value = failFunc && failFunc();
            }
            return value;
        };//ACT
        
        init = function () {
            //check whether func has been provided
            if (func === undefined) {
                throw new Error("shrtct.action: no spec.function has been provided");
            }
            state('default');
            return that;
        };//INIT
        
        that.state = state = function (parameter) {
            var value;
            switch (parameter) {
                case '': //request for current state-value
                    value = curState;
                    break;
                case 'enable': //this is an attempt to enable an action
                    curState = 'enable';
                    //execute enableFunc() if it exists
                    value = enableFunc && enableFunc();
                    break;
                case 'disable': //this is an attempt to disable an action
                    curState = 'disable';
                    //execute enableFunc() if it exists
                    value = disableFunc && disableFunc();
                    break;
                case 'default': //this is an attempt to return state to default
                    value = state(defState);
                    break;
                default: //some unvalid state has been provided
                    throw new Error('shrtct.action: "' + parameter +
                        '" is not a valid state');
            }
            return value;
        };//STATE

        return init();
    };//ACTION
    
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
            createBounds;

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
            createBounds(['jasper', 'hiske', 'iemand']); //testcode
            return that;
        };//INIT

        //PRINT [private]
        //prints row-divs and fields inside the board-element
        print = function () {
            var i, j, row;
            that.front.replaceAll(spec.replace);
            for (i = 0; i < height; i += 1) { //loop over rows
                row = $('<div class="row" />').
                    appendTo(that.front);
                for (j = 0; j < width; j += 1) { //loop over field in row
                    fields[i][j].front.appendTo(row);
                }
            }
            return that;
        };//PRINT

        //CREATE FIELD [private]
        //creates a field at specific coordinates
        createField = function (row, col) {
            //spec object will be handed to field constructor
            var spec = {};
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

        //CREATE BOUNDS [private]
        //creates cards to form a ring on the outermost fields. include bases
        createBounds = function (players) {
            //check whether board is big enough for this to make sense
            if (height > 2 && width > 2) {
                var curField = getField(0, 1),
                    directions = ['right', 'down', 'left', 'up'],
                    dir = 0,
                    fieldsLeft = 2 * (width + height - 4), //don't count corners
                    basesLeft = 2 * players.length, //two bases a player
                    ratio = basesLeft / fieldsLeft,
                    nextField,
                    spec;
                while (curField.getCard() === undefined) {
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
                            basesLeft -= 1;
                            spec.text = players[basesLeft % players.length];
                            //randomly choose a port to connect the base-path to
                            if (Math.floor(Math.random() * 2) === 0) {
                                spec.paths[2] = [0, 5];
                            }
                            else {
                                spec.paths[2] = [1, 4];
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

        return init();
    };//BOARD


    // --- HOLDER ---
    //An element that holds card. Needs extension to become truly usefull
    //[opt]spec.defDrop: Whether holder is droppable. 'enabled' / 'disabled'
    //[opt]spec.type:    Type of element (field, deck). Default: untyped
    shrtct.holder = function(spec) {
        var curCard,
            that,
            init,
            print,
            dropped,
            checkIn,
            doCheckIn;

        //create a generic element to be extended
        that = shrtct.element('holder ' + spec.type);

        //INIT [private]
        init = function () {
            print();
            //create action
            that.doCheckIn = doCheckIn = shrtct.action({
                func: checkIn,
                //failFunc:
                enableFunc: function () {that.front.droppable('enable'); },
                disableFunc: function () {that.front.droppable('disable'); },
                defState: spec.defDrop
            });
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
            dropCard.doMove(that);
        };//DROPPED

        //GET CARD [public]
        that.getCard = function () {
            return curCard;
        };

        //CHECK IN [private]
        //called by a card that likes to move here. If possible (vacant) then
        //card is moved and a checkout-function is returned to card for later.
        checkIn = function (newCard) {
            that.front.append(newCard.front); //move card in DOM
            curCard = newCard; //save link to card
            doCheckIn.state('disable'); //holder no longer droppable
            return function () {
                //a function the card can use to check out again
                //no other object will be able to check the card out
                curCard = undefined;
                doCheckIn.state('default'); //set doCheckIn-state to default
            };
        };//CHECK IN

        return init();
    };//HOLDER


    // --- FIELD --- [inherits from holder]
    //[man]spec.step(): can be used to navigate to adjecent fields
    shrtct.field = function (spec) {
        var that,
            init,
            step;

        //create a gneric element to be extended
        that = shrtct.holder({type: 'field', defDrop: 'enable'});

        //INIT [private]
        init = function ()  {
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
            popCard,
            popCardSmooth,
            doPop;

        //create a new generic element to be extended
        that = shrtct.holder({
            type: 'deck',
            defDrop: 'disable'
        });

        //INIT [private]
        //called (below) to run once when deck is created
        init = function () {
            print();

            //create popAction
            doPop = shrtct.action({
                func: popCardSmooth,
                //failFunc:
                //enableFunc:
                //disableFunc:
                defState: 'enable'
            });

            popCardSmooth();
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
                doPop();
            }
        };

        //POP CARD [private]
        //called when card is clicked to create and show a new card
        popCard = function () {
            var newCard;
            //check whether the deck already contains a card
            if (that.getCard() === undefined) {
                newCard =  shrtct.randCard(that);
                return newCard;
            }
        };//POP CARD

        //POP CARD SMOOTH [private]
        //pop a new card with a reveal-effect
        popCardSmooth = function () {
            var newCard, popCardSmooth2;

            newCard = popCard (); //try to create a new card
            if (newCard !== undefined) { //if succes
                doPop.state('disable'); //no new pops for the moment
                that.front.addClass('flipped'); //do the flip-effect (all CSS)

                //set a timer to fire when the effect is finished
                //300ms also defined in the CSS
                setTimeout(function () {popCardSmooth2(); }, 500);

                popCardSmooth2 = function () {
                    //new pops allowed again
                    doPop.state('enable');
                    //flip back (happens instantly)
                    that.front.removeClass('flipped');
                    //free the new card from the cardWrap-div
                    newCard.front.insertAfter(that.front);
                };//popCardSmooth2
            }

            return that;
        };//POP CARD

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
            init,
            print,
            clicked,
            move,
            rotate,
            doRotate,
            doMove;

        //create a generic element to be extended
        that = shrtct.element('card');

        //INIT [private]
        //called (below) to run once when card is created
        init = function () {
            var i, numPaths = spec.paths.length;
            //create paths
            for (i = 0; i < numPaths; i += 1) {
                paths[i] = shrtct.path({ports: spec.paths[i]});
            }
            print();
            if (spec.holder === undefined) {
                throw new Error("shrtct.card: card holder not specified");
            }
            move(spec.holder);
            if (spec.rotate !== undefined) {
                rotate(spec.rotate);
            }

            //create rotateAction
            doRotate = shrtct.action({
                func: function () {rotate('smooth'); },
                //failFunc:
                enableFunc: function () {that.front.addClass('rotateable'); },
                disableFunc: function () {that.front.removeClass('rotateable'); },
                defState: spec.rotateable
            });

            //create moveAction
            that.doMove = doMove = shrtct.action({
                func: function (field) {
                    move(field);
                    doMove.state('disable');
                },
                //failFunc:
                enableFunc: function () {
                    that.front.draggable('enable');
                    that.front.addClass('draggable');
                },
                disableFunc:  function () {
                    that.front.draggable('disable');
                    that.front.removeClass('draggable');
                },
                defState: spec.moveable
            });

            return that;
        };//INIT

        //PRINT [private]
        //called once at card creation to create DOM-connection
        print = function () {
            var i;
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
            }).appendTo(spec.holder.front);
            if (spec.text !== undefined) {
                that.front.append('<div class="text">' + spec.text + '</div>');
            }
            for (i = 0; i < paths.length; i += 1) {
                paths[i].front.appendTo(that.front);
            }
        };//PRINT

        //CLICKED [private]
        //called when a card is clicked
        clicked = function (event) {
            if (event.which === 3) { //check for right-click
                doRotate();
            }
        };

        //MOVE [private]
        //takes a holder and tries to move card there
        move = move = (function () {
            //create a closure: when checking in at a holder, a checkOut-funcion
            //is saved to check out again when the card is moved again.
            var checkOut;
            return function (holder) {
                var value;
                value = holder.doCheckIn(that);
                if (value) { //card is appended
                    //check out of current holder (if checked in)
                    if(checkOut) {
                        checkOut();
                    }
                    checkOut = value; //bind new checkOut function
                }
                return that;
            };
        })();//MOVE

        //ROTATE [private]
        //1 argument: can be a number (turn increment) or 'smooth' (rot. eff.)
        rotate = (function () {
            var rotation = 0;
            that.front.attr('data-rotation', 0);

            return function (argument) {
            var turns;
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
                
                var i, ii;
                //rotate visually (faster than reprinting all the paths)
                rotation = (rotation + turns * 90);
                that.front.css({
                    'transform':            'rotate(' + rotation + 'deg)',
                    '-moz-transform':       'rotate(' + rotation + 'deg)',
                    '-webkit-transform':    'rotate(' + rotation + 'deg)',
                    '-o-transform':         'rotate(' + rotation + 'deg)'
                });

                //Shift start and exit-port of all paths two places per turn
                for (i = 0, ii = paths.length; i < ii; i += 1) {
                    paths[i].ports[0] = (paths[i].ports[0] + 6 * turns) % 8;
                    paths[i].ports[1] = (paths[i].ports[1] + 6 * turns) % 8;
                }
            };
        })();//ROTATE

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
            follow;

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
            var distance, start, rotation, mirrored, transform;
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
                distance = 8 - distance; //distance of the mirrored path
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
            return that;
        };//PRINT

        //FOLLOW [public]
        //takes a port and returns the other port of this path
        that.follow = follow = function (port) {
            var port2;
            if (port === ports[0]) {
                port2 = ports[1];
            }
            else if (port === ports[1]) {
                port2 = ports[0];
            }
            return port2;
        };//FOLLOW

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

    // === JQUERY OBJECT FUNCTIONS ===
    //finds the shrtct-element belonging to a jQuery-object
    $.fn.shrtct = function () {
        var value, //to be returned later
            test = this.attr('data-shrtct'); //all shrtct-elements have this
        if (test !== undefined) {
            value = shrtct.elements[test];
        } else {
            throw new Error("jQuery.fn.shrtct: 'this' is not a card or board.");
        }
        return value;
    };


    // === EXECUTE WHEN DOCUMENT IS LOADED ===
    $(document).ready(function () {
        //DISABLE CONTEXT-MENU
        $('body').bind('contextmenu', function (event) {
            return false;
        });
        
        //BUILD FIELD
        var board = shrtct.board({
            replace:   $('#board'),
            width:      6,
            height:     6
        });

        shrtct.deck({
            replace:    $('#deck')
        });
        
        //CREATE TEST BUTTON
        $('body').prepend('<div id="testButton" style="float: right; border: 1px solid #aaa;" >test</div>');
        $('#testButton').click(function () {
            alert(board.getField(0,1).getCard().step(0));
        });
    });

    }());