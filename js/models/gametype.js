// --- GAME TYPE ---
//extends the game model with rules

/*
This model can contain several functions that can define rules for the game.

For instance, certain functions are called when an attempt is made to start the
game, go to the next turn, etc. These function calls can be found in the
parent-model, game.js.
*/

define(['js/models/game', 'js/functions/makeBounds',
'js/functions/makeRandomCard'],
function (Game, makeBounds, makeRandomCard) {
    return Game.extend({

        validateStart: function (setup) {
        //this function validates the contents of the game model.
        //will return either 'true' if game can start or an array of strings
        //.. with error messages.
            var errors = [],
                boardSize = setup.boardSize,
                result, playerNum, playerMax;

            playerNum = setup.playerNames.length;
            playerMax = 2 * boardSize;

            //check if number of player isn't to large
            if (playerNum < 0) {
                errors.push("Not enough players.");
            }
            if (playerNum > playerMax) {
                errors.push("To many players for this board-size.");
            }
            if (boardSize < 1) {
                errors.push("Board-size is too small.");
            }

            //check whether any errors were found
            if (errors.length === 0) {
                result = true;
            }
            else {
                result = errors;
            }
            
            return result;
        },

        setup: function (setup) {
        //this function sets up the game elements
            var playerNames = setup.playerNames,
                i, board;

            //create players
            for (i = playerNames.length; i--;) {
                this.newPlayer({ name: playerNames[i] });
            }

            //create board
            board = this.newBoard({
                size: setup.boardSize + 2 //add 2 for bounds
            });
            makeBounds({
                game: this,
                board: board,
                players: this.players
            });

            //create deck
            var deck = this.newDeck({
                cardCreator: makeRandomCard,
                popLock: false
            });
            deck.pop();
        }

    });
});