const R = require('ramda');
//This probability exponent was found by experimentation.
const PROBABILITY_EXPONENT = 1.2;
const CARDS = require('./cards').map(R.evolve({ prob: p => Math.pow(p, PROBABILITY_EXPONENT) }));
const PROBABILITY_SUM = CARDS.reduce((sum, card) => sum + card.prob, 0);

function getRandomCard() {
    //Using tower sampling to find a card among a list of cards with weighted probabilities.
    const RAND = Math.random() * PROBABILITY_SUM;
    const CARD = findCard(RAND, CARDS);
    return {
        paths: CARD.paths.map(ports => ({ ports: ports })),
        rotation: Math.floor(Math.random() * 4) * 90
    };
}

function findCard(DISTANCE, CARDS) {
    const CARD = R.head(CARDS);
    if (CARDS.length === 1) {
        return CARD;
    }
    const NEW_DISTANCE = DISTANCE - CARD.prob;
    if (NEW_DISTANCE <= 0) {
        return CARD;
    } else {
        return findCard(NEW_DISTANCE, R.tail(CARDS));
    }
}

module.exports = getRandomCard;
