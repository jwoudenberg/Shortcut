// --- GAME TYPE VIEW ---
//extends a game view with game-type specific formatting

define(['underscore', 'js/models/gametype', 'js/views/game/game-view',
    'text!templates/cardsize.css'],
function (_, GameType, GameView, cardSizeCSS) {
    return GameView.extend({

        GameType: GameType,

        newBoard: function (board, view) {
            //in this gametype only a single board is created, thus
            this.boardView = view;
        },

        newDeck: function (deck, view) {
            //in this gametype only a single deck is created, thus
            this.deckView = view;
        },

        resize: function () {
            //called when the game is rendered or the windows size changes
            var height, width, size, cardSize;

            //get the height and with of the #content div
            height = $('#content').height(),
            width = $('#content').width();

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

    });
});