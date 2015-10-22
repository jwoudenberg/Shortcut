import { Map, Set } from 'immutable';
import { evolve, head, tail } from 'ramda';
import { getUuidGenerator } from './rules/world-state-utils';
import protoCards from './cards.json';

//This probability exponent was found by experimentation.
const probabilityExponent = 1.2;
const cards = protoCards.map(evolve({ probability: p => Math.pow(p, probabilityExponent) }));
const probabilitySum = cards.reduce((sum, { probability }) => sum + probability, 0);

export default function getRandomCard (seed) {
    const uuidGenerator = getUuidGenerator(seed);
    const uuid = () => uuidGenerator.next().value;
    //Using tower sampling to find a card among a list of cards with weighted probabilities.
    const randomNumber = seed * probabilitySum;
    const { paths: protoPaths } = findCard(randomNumber, cards);
    const paths = Set(protoPaths).map(
        ports => Map({ ports: Set(ports), id: uuid() })
    );
    return Map({
        id: uuid(),
        paths,
        rotation: Math.floor(seed * 4) * 90
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
