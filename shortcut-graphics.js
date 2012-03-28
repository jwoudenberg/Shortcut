//This file contains all DOM related code
(function () {"use strict";
    //setup easy-access variables (saves jslint nagging below)
    var $ = jQuery,
        sc = shrtct,
        frontend = {
            fronts: []
        };

    //Check of core-shortcut file and jQuery are loaded
    if (sc === undefined) {
        throw new Error("shortcut.js is not loaded.");
    }
    if ($ === undefined) {
        throw new Error("jquery is not loaded.");
    }


    //ELEMENT
    frontend.element = function (element) {
        var id = element.getID(),
            front;

        frontend.fronts[id] = front = $('<div data-shrtct="' + id + '" />');

        front.getElement = function () {
            return element;
        };

        return front;
    };

    //ELEMENT TO FRONT
    frontend.elementToFront = function (element) {
        if (element === undefined) {
            throw new Error("frontend.elementToFront: no element passed.");
        }
        return frontend.fronts[element.getID()];
    };

    //JQUERY TO FRONT
    frontend.jqueryToFront = function (object) {
        return frontend.fronts[object.attr('data-shrtct')];
    };



    //BOARD
    sc.board.bind(function (result) {
        var board = result,
            that = frontend.element(board).addClass('board'),
            print;

        print = function () {
            var height = board.getHeight(),
                width = board.getWidth(),
                i,
                j,
                row;

            for (i = 0; i < height; i++) { //loop over rows
                row = $('<div class="row" />').appendTo(that);

                for (j = 0; j < width; j++) { //loop over field in row
                    frontend.field(board.getField(i, j)).appendTo(row);
                }
            }

            //print to DOM
            $('#gameScreen').append(that);
        };

        print();

        return that;
    });//BOARD

    //DECK
    sc.deck.bind(function (result) {
        var deck = result,
            that = frontend.holder(result).addClass('deck'),
            print,
            clicked,
            pop;

        print = function () {
            //print to DOM
            $('#gameScreen').append(that);

            that.wrap('<div class="deckWrap" />').
                html('<div class="cardBack"><div class="text">card</div></div>');

            that.parent('.deckWrap').mousedown(function (event) {
                //register mousedown even handler (for card creation)
                clicked(event);
                event.preventDefault();
            });

            //we need an addition wrapper div for the flip effect
            //that = that.children('.cardWrap');
        };

        clicked = function (event) {
            if (event.which === 1) { //check for left-click
                deck.pop();
            }
        };

        pop = function () {
            var pop2;

            deck.pop.disable(); //no new pops for the moment
            that.addClass('flipped'); //do the flip-effect (CSS)

            //set a timer to fire when the effect is finished
            //300ms also defined in the CSS
            setTimeout(function () {pop2(); }, 500);

            pop2 = function () {
                //new pops allowed again
                deck.pop.enable();
                //flip back (happens instantly)
                that.removeClass('flipped');
                //free the new card from the cardWrap-div
                //newCard.front.insertAfter(that.front);
            };//pop2

        };

        deck.pop.bind(pop);

        print();

        return that;
    });//DECK

    //CARD
    sc.card.bind(function (result) {
        var card = result,
            that = frontend.element(card).addClass('card').attr('data-rotation', 0),
            print,
            clicked,
            move,
            rotate;

        print = function () {
            var i;

            //rotation attribute
            that.attr('data-rotation',0).draggable({
                //make card draggable
                revert: 'invalid',  //jump back if not dropped on a droppable
                revertDuration: 100,//jump back-animation
                helper: 'original'
            }).css({position: 'absolute'}).mousedown(function (event) {
                //register mousedown even handler (for rotation)
                event.stopPropagation();
                clicked(event);
                event.preventDefault();
            });

            for (i = card.paths.length; i--;) {
                frontend.path(card.paths[i]).appendTo(that);
            }
        };

        clicked = function (event) {
            if (event.which === 3) { //check for right-click
                card.rotate('smooth');
            }
        };

        //MOVE
        move = function () {
            frontend.elementToFront(card.getHolder()).prepend(that);
        };

        card.move.enable.bind(function () {
            that.draggable('enable');
            that.addClass('draggable');
        });

        card.move.disable.bind(function () {
            that.draggable('disable');
            that.removeClass('draggable');
        });

        card.move.bind(move);
        card.move.reset();

        //ROTATE
        rotate = (function () {
            var rotation = 0;

            return function () {
                rotation = (rotation + 90);
                that.addClass('rotateSmooth');

                that.css({
                    'transform':            'rotate(' + rotation + 'deg)',
                    '-moz-transform':       'rotate(' + rotation + 'deg)',
                    '-webkit-transform':    'rotate(' + rotation + 'deg)',
                    '-o-transform':         'rotate(' + rotation + 'deg)'
                });
            };
        })();

        card.rotate.bind(rotate);

        print();
        move();

        return that;
    });//CARD

    //PATHS
    frontend.path = function (result) {
        var path = result,
            that = frontend.element(path).addClass('path'),
            print;

        print = function () {
            var ports = path.ports,
                distance,
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
            $('#path-' + distance).clone().removeAttr('id').
                appendTo(that).children('g').attr('transform', transform);

            return that;
        };

        print();

        return that;
    };//PATHS

    //HOLDER
    frontend.holder = function (result) {
        var holder = result,
            that = frontend.element(holder).addClass('holder'),
            print,
            dropped;

        print = function () {
            //make fields droppable
            that.droppable({
                drop: function (event, ui) {
                    //remove positioning-css in style-attribute
                    ui.draggable.css({left: 0, top: 0, position: 'absolute'});
                    //call function with dropped card as an argument
                    dropped(frontend.jqueryToFront(ui.draggable));
                }
            });
        };

        dropped = function (dropCard) {
            dropCard.getElement().move(that.getElement());
        };

        //create handlers for enable and disable event
        holder.checkIn.enable.bind(function () {that.droppable('enable'); });
        holder.checkIn.disable.bind(function () {that.droppable('disable'); });

        print();

        return that;
    };//HOLDER

    //FIELD
    frontend.field = function (result) {
        return frontend.holder(result).addClass('field');
    };//FIELD

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
                    width:      boardSize,
                    height:     boardSize
                });
                board.createBounds(players); //testcode
                //BUILD DECK
                shrtct.deck();
            }
        })
        /*
        //CREATE TEST BUTTON
        $('body').prepend('<div id="testButton" style="float: right; border: 1px solid #aaa;" >test</div>');
        $('#testButton').click(function () {

        });
        */
    });

})();