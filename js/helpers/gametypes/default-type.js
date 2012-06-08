/* --- GAME TYPE ---   
    This object contain several functions that define rules for the game. These
    functions are hooks, called at particular moments in the games run by Game
*/

define(['js/helpers/makeBounds', 'js/helpers/makeRandomCard'],
function (makeBounds, makeRandomCard) {
    return {

        validateStart: function (setup) {
        //This function validates the contents of the game model.
        //will return either 'true' or array of strings with failure messages
        //Placed here to allow validation without creating a game object
            var errors = [],
                boardSize = setup.boardSize,
                result, playerNum, playerMax;

            playerNum = setup.playerNames.length;
            playerMax = 2 * boardSize;

            //check if number of player isn't to large
            if (playerNum < 0) {
                errors.push("Negative players not allowed.");
            }
            if (boardSize < 1) {
                errors.push("Board-size is too small.");
            }
            else if (playerNum > playerMax) {
                errors.push("To many players for this board-size.");
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

    };
});