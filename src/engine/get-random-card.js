import { Map, Set } from 'immutable';
import { evolve, head, tail } from 'ramda';
import { v4 as uuid } from 'node-uuid';
import protoCards from './cards.json';

//This probability exponent was found by experimentation.
const probabilityExponent = 1.2;
const cards = protoCards.map(evolve({ probability: p => Math.pow(p, probabilityExponent) }));
const probabilitySum = cards.reduce((sum, { probability }) => sum + probability, 0);

export default function getRandomCard () {
    //Using tower sampling to find a card among a list of cards with weighted probabilities.
    const randomNumber = Math.random() * probabilitySum;
    const { paths: protoPaths } = findCard(randomNumber, cards);
    const paths = Set(protoPaths).map(
        ports => Map({ ports: Set(ports) })
    );
    return Map({
        id: uuid(),
        paths,
        rotation: Math.floor(Math.random() * 4) * 90
    });
}

function findCard (distance, _cards) {
    const card = head(_cards);
    const newDistance = distance - card.probability;
    if (newDistance <= 0) {
        return card;
    } else {
        return findCard(newDistance, tail(_cards));
    }
}
