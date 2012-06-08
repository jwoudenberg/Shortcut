/* --- GAME TYPE ---   
    This object contain several functions that determine the way the game is
    displayed. These functions are called by gametypeView
*/

define(['underscore', 'text!templates/cardsize.css'],
function (_, cardSizeCSS) {
    return {

        close: function () {
            //remove subviews
            if (this.boardView) {
                this.boardView.remove();
            }
            if (this.deckView) {
                this.deckView.remove();
            }
        },

        withNewBoard: function (boardView) {
            this.boardView = boardView; //this gametype has only one board
        },

        withNewDeck: function (deckView) {
            this.deckView = deckView; //this gametype has only one deck
        },

        arrange: function () {
            //only attempt a resize of all game elements are present
            if (this.boardView && this.deckView) {
                //called when the game is rendered or the windows size changes
                var height, width, size, cardSize;
    
                //get the height and with of the #content div
                height = this.$el.height(),
                width = this.$el.width();
    
                //the board is made as large as possible
                size = Math.min(height, width);
                this.boardView.$el.css({
                    width:  size+'px',
                    height: size+'px'
                });
    
                //place deck (falls off screen if #content is nearly rectangular)
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
    
                //calculate the size of each field
                cardSize = Math.floor(size / this.boardView.model.get('size')) - 2;
    
                //need to replace this with an underscore template
                $('style').html(_.template(cardSizeCSS, {
                    cardSize: cardSize,
                    fontSize: cardSize/100
                }));
            }
        }

    };
});