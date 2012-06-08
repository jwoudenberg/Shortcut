/* --- GAME TYPES ---
    An object containing different game types and their views
*/

define(['js/helpers/gametypes/default-type.js',
    'js/helpers/gametypes/default-view.js'],
function (defaultType, defaultView) {
    return {
        'default': {
            type:   defaultType,
            view:   defaultView
        }
    };
});