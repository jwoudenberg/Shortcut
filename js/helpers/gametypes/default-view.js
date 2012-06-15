/* --- GAME TYPE ---
    This object contain several functions that determine the way the game is
    displayed. These functions are called by gametypeView
*/

define(['underscore', 'text!templates/cardsize.css',
    'js/helpers/getRandomColor', 'text!templates/turn.html'],
function (_, cardSizeCSS, getRandomColor, turnTemplate) {
    return {

        boardView:  undefined,
        deckView:   undefined,

        onStart: function () {
            this.onNewTurn(this.model.turns.last());
        },

        close: function () {
            //delete references
            delete this.boardView;
            delete this.deckView;
        },

        withNewBoard: function (boardView) {
            this.boardView = boardView; //this gametype has only one board
        },

        withNewDeck: function (deckView) {
            this.deckView = deckView; //this gametype has only one deck
        },

        onNewTurn: function (turn) {
            this.mainView.showText(_.template(turnTemplate,
                { player: turn.get('player').get('name') }));
        },

        arrange: function () {
            //only attempt a resize of all game elements are present
            if (this.boardView && this.deckView) {
                var boardSize, gridSize, cardSize, height, width;

                //number of fields the board is long and hight
                boardSize = this.boardView.model.get('size');
                //the view needs an adition 1.5 fields of space in one direction
                gridSize = [boardSize + 1.5, boardSize];

                //get the height and with of the parent div
                height = this.$el.parent().height(),
                width = this.$el.parent().width();

                //cardsize is shortest dimensions of view and grid devided, or
                //longest dimensions devided, whichever is smaller
                cardSize = Math.floor(Math.min(
                    Math.min(width, height) / Math.min(gridSize[0], gridSize[1]),
                    Math.max(width, height) / Math.max(gridSize[0], gridSize[1])
                ));

                if (width > height) {
                    this.deckView.$el.css({
                        top:    0,
                        left:   (boardSize + 0.5)*100 + '%'
                    });
                }
                else {
                    this.deckView.$el.css({
                        top:    (boardSize + 0.5)*100 + '%',
                        left:   0
                    });
                }

                //place board in the top-left corner
                this.boardView.$el.css({
                    top:    '1px',
                    left:   '1px'
                });

                //resize the fields
                $('#cardSizeStyle').html(_.template(cardSizeCSS, {
                    cardSize: cardSize,
                    fontSize: cardSize/100
                }));

            }
        },

        onNewRoute: function (route) {
            //only create a path if no goal was specified or a goal was reached
            if (!route.get('goal') || route.get('goalReached')) {
                var color = getRandomColor();

                //trigger event for paths in route to highlight the path
                route.paths.forEach(function (path) {
                    path.trigger('highlight', {
                        color:  color,
                        strong: true
                    });
                }, this);

                //when the route ceases to exits, remove strong effect
                route.on('destroy', function () {
                    route.paths.forEach(function (path) {
                        path.trigger('highlight', {
                            strong: false
                        });
                    }, this);
                    route.off('destroy', null, this); //remove this event handler
                }, this);
            }
        },

        onFinish: function (winners) {
            var length = winners.length,
                string, i;

            if (length === 0) {
                string = 'Game has ended in a draw.';
            }
            else if (length === 1) {
                string = winners[0].get('name') + ' has won!';
            }
            else {
                string = '';
                for (i = length-1; i > 0; i--) {
                    string += winners[i].get('name') + ', ';
                }
                string += ' and ' + winners[0].get('name');
            }

            this.mainView.showText('<h1>' + string + '</h1>');
        }

    };
});