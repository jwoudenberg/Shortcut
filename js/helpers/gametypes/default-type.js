/* --- GAME TYPE ---
    This object contain several functions that define rules for the game. These
    functions are hooks, called at particular moments in the games run by Game

    This game mode is played with a single board and deck. Players take turns
    taking, placing and optionally rotating a new card from the deck, or
    rotating a card already on the board. The first player to connect his/her
    bases wins.
*/

define(['js/helpers/makeBounds'],
function (makeBounds) {
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

        validateTurn: function (turn) {
            var changes = turn.changes,
                change, attr, cid;

            //the deck must be empty
            if (this.decks.first().card()) {
                return 'Move the drawn card to a field on the board.';
            }

            //check right moves-combination
            for (var hash in changes) {
                change = changes[hash];
                attr = change.attr;

                //only a single card can be manipulated in a turn
                if (attr === 'holder' || attr === 'rotation') {
                    //moving is only allowed with a new card
                    if (cid && cid !== change.model.cid) {
                        //onNewTurn() should prevent this from happening
                        return "You are allowed to manipulate only a single card.";
                    }
                    cid = change.model.cid; //save active card
                    if (attr === 'holder' && change.before !== undefined) {
                        //onNewTurn() should prevent this from happening
                        return "Don't move a card that was already on the board.";
                    }

                }
                else return "Illegal move!"; //it shouldn't come to this
            }

            //player must have done something.
            if (!cid) return 'You must make a move.';

            //all requirements passed!
            return true;
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
            this.newDeck({
                popLock: false
            });
        },

        onChange: function (type, attr, model) {
            //if a card is moved or rotated, lock all other cards
            if (type === 'card' && (attr === 'holder' || attr === 'rotation')) {
                var otherCards = this.cards.without(model);
                return {
                    holder:     otherCards,
                    rotation:   otherCards,
                    pop:        [ this.decks.first() ] //first and only deck
                };
            }
        },

        onTurnStart: function (turn) {
            var player = turn.get('player'),
                route1, route2;

            //attempt first route
            route1 = this.newRoute({
                begin:  player.bases.at(0)
            });

            //bases aren't connected. Draw second route.
            route2 = this.newRoute({
                begin:  player.bases.at(1)
            });

            this.cards.forEach(function (card) {
                var field = card.get('holder'),
                    row = field.get('row'),
                    col = field.get('col'),
                    boardSize = field.board.get('size');

                //cards aren't allowed to move
                card.set('moveLock', true, {noLog: true});

                //cards can rotate if they are on a route
                if (route1.cards.indexOf(card) === -1 && route2.cards.indexOf(card) === -1) {
                    //the card is not on either route
                    card.set('rotateLock', true, {noLog: true});
                }
                else {
                    //unblock card, but not if its on the edge of the board
                    if (row > 0 && row < boardSize-1 && col > 0 && col < boardSize-1) {
                        card.set('rotateLock', false, {noLog: true});
                    }
                }
            }, this);
        },

        onTurnEnd: function (turn) {
            var winners, emptyField;

            //check if someone has won
            winners = this.players.filter(function (player) {
                //create a path between the bases and see if the goal is reached
                var route = this.newRoute({
                    begin:  player.bases.at(0),
                    goal:   player.bases.at(1)
                });
                if (route.get('goalReached')) return true;
            }, this);

            if (winners.length) {
                return winners; //signal that the game is over
            }
        }

    };
});