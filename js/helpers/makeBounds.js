// --- CREATE BOUNDS ---
/* Creates a number of cards to form the boundaries of a board */

define([],
function () {
    return function (options) {

        var game = options.game,
            board = options.board,
            players = options.players,
            size = board.get('size'),
            numPlayers = players.length,
            protoCards = [],
            basePair, base, basePosition, player, createBoundCard, i, j;

        //utility function for easy creation of bound cards
        createBoundCard = function (protoCard) {
            protoCard.moveLock = true;
            protoCard.rotateLock = true;
            return game.newCard(protoCard);
        };

        //check whether board is big enough
        if (size <= 1) {
            throw new Error("makeBounds: board is to small for bounds.");
        }
        if (numPlayers > 2 * (size - 2)) {
            throw new Error("makeBounds: too many players for this board size.");
        }


        //create the corner-cards
        createBoundCard({
            paths: [[1, 2]],
            holder: board.getField(0, 0),
            rotation: 0
        });
        createBoundCard({
            paths: [[1, 2]],
            holder: board.getField(0, size-1),
            rotation: 1
        });
        createBoundCard({
            paths: [[1, 2]],
            holder: board.getField(size-1, size-1),
            rotation: 2
        });
        createBoundCard({
            paths: [[1, 2]],
            holder: board.getField(size-1, 0),
            rotation: 3
        });

        //create the border-cards
        for (i = 1; i < (size - 1); i++) {
            /* Right now only protoCards are created. They are saved in pairs
               formed by opposite lying cards (possible sets for player bases)
            */
            protoCards[i - 1] = [];
            protoCards[i - 1][0] = {
                paths: [[0, 7], [1, 2]],
                holder: board.getField(0, i),
                rotation: 0
            };
            protoCards[i - 1][1] = {
                paths: [[0, 7], [1, 2]],
                holder: board.getField(size-1, size-1 - i),
                rotation: 2
            };

            protoCards[size-3 + i] = [];
            protoCards[size-3 + i][0] = {
                paths: [[0, 7], [1, 2]],
                holder: board.getField(i, size-1),
                rotation: 1
            };
            protoCards[size-3 + i][1] = {
                paths: [[0, 7], [1, 2]],
                holder: board.getField(size-1 - i, 0),
                rotation: 3
            };
        }

        //choose player-base positions 2*(size-2) positions available
        for (i = numPlayers; i--;) {
            player = players.at(i);
            basePosition = Math.floor(i * 2 * (size - 2) / numPlayers);
            basePair = protoCards[basePosition];

            //do for both protoCards in the basePair
            for (j = 2; j--;) {
                base = basePair[j];
                //add base-path
                base.paths.push({
                    start: 0,
                    owner: player
                });
            }

        }

        //create boundary cards from proto-cards
        for (i = protoCards.length; i--;) {
            createBoundCard(protoCards[i][0]);
            createBoundCard(protoCards[i][1]);
        }

    };
});