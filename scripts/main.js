require(['jquery', 'lib/jquery-ui', 'game', 'graphics'], function($, ui, shrtct) {

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
});