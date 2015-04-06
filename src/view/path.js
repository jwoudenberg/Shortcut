const React = require('react');
const R = require('ramda');
const PATH_SVG_DATA = require('./pathSVGData');
const PATH_DISTANCE_TO_SHAPE_MAP = {
    '-4': { type: 's_turn' },
    '-3': { type: 'straight' },
    '-2': { type: 'l_turn', transforms: [{ rotate: 90 }] },
    '-1': { type: 'sharp_turn' },
    '0': { type: 'dead_end' },
    '1': { type: 'u_turn' },
    '2': { type: 'l_turn' },
    '3': { type: 'wide_turn' },
    '4': { type: 's_turn' }
};

class Path extends React.Component {
    _getEvenPathShape(start, distance) {
        let addDefaults = R.merge({
            type: null,
            rotation: 0,
            transforms: []
        });
        let shape = addDefaults(PATH_DISTANCE_TO_SHAPE_MAP[distance]);
        return shape;
    }
    _getOddPathShape(start, distance) {
        //Odd ports (1,3,5,7) will use mirror images of even ports (0,2,4,6)
        distance = -distance;
        let shape = R.pipe(
            this._getEvenPathShape.bind(this),
            R.evolve({ transforms: R.append({ mirror: true })})
        )(start, distance);
        return shape;
    }
    _getPathShape(port1, port2) {
        //If only one port is given, set the second one to equal the first.
        port2 = R.defaultTo(port1, port2);

        let maybeShorterDistance = n => (n <= 4) ? n : (n - 8);
        let distance = R.pipe(
            R.subtract,
            Math.abs,
            maybeShorterDistance
        )(port1, port2);

        let start = Math.min(port1, port2);

        let even = n => !(n % 2);
        let getShape = R.ifElse(even, this._getEvenPathShape.bind(this), this._getOddPathShape.bind(this));
        let rotation = R.mathMod(-Math.floor(start / 2) * 90, 360);
        let rotate = R.evolve({ transforms: R.append({ rotate: rotation })});
        let shape = R.pipe(getShape, rotate)(start, distance);
        return shape;
    }
    _getTransformString(transform) {
        let [type, amount] = R.toPairs(transform)[0];
        let transformString = R.cond(
            [R.eq('rotate'), (type, rotation) => `rotate(${rotation} 375 375)`],
            [R.eq('mirror'), () => 'scale(-1 1) translate(-750, 0)'],
            [R.T, (type) => { throw new Error('Unknown transform type ' + type); }]
        )(type, amount);
        return transformString;
    }
    render() {
        let { type, transforms } = this._getPathShape(...this.props.ports);
        let svgPaths = PATH_SVG_DATA[type];
        let transformAttr = transforms.reverse().map(this._getTransformString).join(' ');
        return <div className="path">
            <svg version="1.1" viewBox="0 0 750 750">
                <g className="pathContainer" transform={transformAttr}>
                    {svgPaths.map(function drawSVGPath(svgPath) {
                        return <path key={svgPath.d} {...svgPath} />;
                    })}
                </g>
            </svg>
        </div>;
    }
}

module.exports = Path;
