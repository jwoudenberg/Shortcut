// --- PREP ---
//collects game-related info and allows game to start

define(['backbone'],
function (Backbone) {
    return Backbone.Model.extend({

        defaults: {
            players: [{ name: 'Player 1' }, { name: 'Player 2' }],
            boardSize: 2
        },

        start: function () {
            //check whether parameters are valid            
            if (true) { //no check iplemented yet
                var i,
                    players = this.get('players'),
                    boardSize = this.get('boardSize'),
                    game = this.get('game');
                for (i = players.length; i--;) {
                    game.get('players').add({ name: players[i].name });
                }
                game.get('boards').add({
                    width: boardSize,
                    height: boardSize
                });
            }
        }//start

    });
});