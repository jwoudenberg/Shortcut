// --- MAKE RANDOM CARD ---
/* Algorithm that produces a pseudo-random card */

define([],
function () {
        //all unique cards (cards that cannot be rotated into each other)
        //the more symmetries a card has, the lower its probability
        var types = [
                {paths: [[0, 7], [1, 2], [3, 4], [5, 6]], prob: 1},
                {paths: [[0, 7], [1, 2], [3, 5], [4, 6]], prob: 3},
                {paths: [[0, 7], [1, 2], [3, 6], [4, 5]], prob: 3},
                {paths: [[0, 7], [1, 3], [2, 5], [4, 6]], prob: 3},
                {paths: [[0, 7], [1, 3], [2, 6], [4, 5]], prob: 4},
                {paths: [[0, 7], [1, 4], [2, 5], [3, 6]], prob: 3},
                {paths: [[0, 7], [1, 4], [2, 6], [3, 5]], prob: 4},
                {paths: [[0, 7], [1, 5], [2, 3], [4, 6]], prob: 4},
                {paths: [[0, 7], [1, 5], [2, 4], [3, 6]], prob: 4},
                {paths: [[0, 7], [1, 5], [2, 6], [3, 4]], prob: 2},
                {paths: [[0, 7], [1, 6], [2, 3], [4, 5]], prob: 3},
                {paths: [[0, 7], [1, 6], [2, 4], [3, 5]], prob: 3},
                {paths: [[0, 7], [1, 6], [2, 5], [3, 4]], prob: 2},
                {paths: [[0, 6], [1, 3], [2, 4], [5, 7]], prob: 2},
                {paths: [[0, 6], [1, 3], [2, 5], [4, 7]], prob: 3},
                {paths: [[0, 6], [1, 3], [2, 7], [4, 5]], prob: 3},
                {paths: [[0, 6], [1, 4], [2, 3], [5, 7]], prob: 3},
                {paths: [[0, 6], [1, 4], [2, 5], [3, 7]], prob: 4},
                {paths: [[0, 6], [1, 4], [2, 7], [3, 5]], prob: 3},
                {paths: [[0, 6], [1, 5], [2, 3], [4, 7]], prob: 4},
                {paths: [[0, 6], [1, 5], [2, 4], [3, 7]], prob: 3},
                {paths: [[0, 6], [1, 7], [2, 3], [4, 5]], prob: 3},
                {paths: [[0, 6], [1, 7], [2, 4], [3, 5]], prob: 2},
                {paths: [[0, 5], [1, 3], [2, 6], [4, 7]], prob: 4},
                {paths: [[0, 5], [1, 4], [2, 3], [6, 7]], prob: 2},
                {paths: [[0, 5], [1, 4], [2, 6], [3, 7]], prob: 2},
                {paths: [[0, 5], [1, 4], [2, 7], [3, 6]], prob: 1},
                {paths: [[0, 5], [1, 6], [2, 3], [4, 7]], prob: 3},
                {paths: [[0, 4], [1, 3], [2, 5], [6, 7]], prob: 4},
                {paths: [[0, 4], [1, 3], [2, 6], [5, 7]], prob: 3},
                {paths: [[0, 4], [1, 5], [2, 3], [6, 7]], prob: 2},
                {paths: [[0, 4], [1, 5], [2, 6], [3, 7]], prob: 1},
                {paths: [[0, 3], [1, 5], [2, 6], [4, 7]], prob: 2},
                {paths: [[0, 3], [1, 6], [2, 5], [4, 7]], prob: 1},
                {paths: [[0, 1], [2, 3], [4, 5], [6, 7]], prob: 1}
            ],
            probSum = 0,
            i;

        //Convert rough probabilities (1-4) into 'real' relative probs.
        //Sum all probs as preperation for tower sampling. 
        for (i = 0; i < types.length; i += 1) {
            //this probability modifies was found by experimenting
            types[i].prob = Math.pow(types[i].prob, 1.2);
            probSum += types[i].prob;
        }

    //function that picks a card from above list
    return function (holder) {
        var paths, rotation;

        //tower sampling: pick a random value between 0 and probSum
        var rand = Math.random()*probSum,
            i = 0;
        //loop over types subtracting probs until random turns negative
        do {
            rand -= types[i].prob;
            i += 1;
        }
        while (rand > 0);

        //we have now overshot our chosen type by one, se we use i-1
        paths = types[i-1].paths;
        rotation = Math.floor(Math.random()*4); //give card a random orientation

        //create and return card
        return {
                holder:     holder,
                paths:      paths,
                rotation:   rotation,
                moveLock:   false,
                rotateLock: false
            };
    };
});