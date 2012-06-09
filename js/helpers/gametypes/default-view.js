/* --- GAME TYPE ---   
    This object contain several functions that determine the way the game is
    displayed. These functions are called by gametypeView
*/

define(['underscore', 'text!templates/cardsize.css',
    'js/helpers/getRandomColor', 'js/helpers/makeRouteCached'],
function (_, cardSizeCSS, getRandomColor, makeRouteCached) {
    return {

        boardView:  undefined,
        deckView:   undefined,

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

        withNewCard: function (cardView) {
            //try to create a route
            cardView.events.click = this.cardClick;
            cardView.delegateEvents();
        },

        arrange: function () {
            //only attempt a resize of all game elements are present
            if (this.boardView && this.deckView) {
                //called when the game is rendered or the windows size changes
                var boardSize, height, width, size, diff, cardSize;

                boardSize = this.boardView.model.get('size');
    
                //get the height and with of the #content div
                height = this.$el.height(),
                width = this.$el.width();
    
                //the board is made as large as possible
                size = Math.min(height, width);
                this.boardView.$el.css({
                    width:  size+'px',
                    height: size+'px'
                });
    
                //calculate the size of each field
                cardSize = Math.floor(size / boardSize - 2); //-2 for borders

                //deal with almost rectangular boards
                diff = Math.abs(height - width);
                if (diff < cardSize + 30) {
                    //almost rectangular board: not enough space for deck
                    //every field, including the deck, has to give a little
                    cardSize -= Math.ceil((cardSize + 30 - diff) / (boardSize  + 1));

                    //recalculate total size
                    size = (cardSize + 2) * boardSize;
                }

                //place deck
                if (height > width) {
                    this.deckView.$el.css({
                        top:    size+30+'px',
                        left:   '9px'
                    });
                }
                else {
                    this.deckView.$el.css({
                        top:    '9px',
                        left:   size+30+'px'
                    });
                }

                //apply relevent css
                $('#cardSizeStyle').html(_.template(cardSizeCSS, {
                    cardSize: cardSize,
                    fontSize: cardSize/100
                }));
            }
        },

        cardClick: function (event) {
        //if a dead-end path is presented, create a route
            var path = this.model.paths.where({ end: 'unconnected' })[0],
                goal, route;

            if (path !== undefined) {
                var color;

                //find the other base of this owner; it is the goal of the route
                if (path.owner.bases.at(0).cid === path.cid) {
                    goal = path.owner.bases.at(1);
                }
                else {
                    goal = path.owner.bases.at(0);
                }

                route = makeRouteCached({
                    begin: path,
                    goal: goal
                });

                color = getRandomColor();
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

    };
});