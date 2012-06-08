/* --- GAME TYPES ---
    An object containing different game types and their views
*/

define(['js/models/gametype.js', 'js/views/game/gametype-view.js'],
function (Gametype, GametypeView) {
    return {
        'default': {
            Gametype:       Gametype,
            GametypeView:   GametypeView
        }
    };
});