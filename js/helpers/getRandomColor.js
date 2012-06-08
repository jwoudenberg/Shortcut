// --- GET RANDOM COLOR ---
/* Returns colors one by one from a shuffled list. */

define(['underscore'],
function (_) {
        //all colors
        var colors = _.shuffle(['#ff0000', '#ffa600', '#2e8b56', '#8327b8',
            '#5a36eb', '#57b532', '#d11981', '#b3672d']),
            numColors = colors.length,
            i = 0;

    return function () {
        var color = colors[i];      //pick color
        i = (i + 1) % numColors;    //iterate to the next color
        return color;
    };
});