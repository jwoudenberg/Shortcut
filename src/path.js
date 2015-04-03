const React = require('react');
const R = require('ramda');
const PATH_SVG_DATA = require('./pathSVGData');
const PATH_DISTANCE_TO_SHAPE_MAP = {
    '-4': { type: 's_turn', mirrored: true },
    '-3': { type: 'straight' },
    '-2': { type: 'l_turn', rotation: 270 },
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
            mirrored: false
        });
        let addRotation = R.evolve({
            rotation: R.pipe(
                R.add(-Math.floor(start / 2) * 90),
                R.flip(R.mathMod)(360)
            )
        });
        let shape = R.pipe(
            addDefaults,
            addRotation
        )(PATH_DISTANCE_TO_SHAPE_MAP[distance]);
        return shape;
    }
    _getOddPathShape(start, distance) {
        //Odd ports (1,3,5,7) will use mirror images of even ports (0,2,4,6)
        distance = -distance;
        return R.pipe(
            this._getEvenPathShape.bind(this),
            R.evolve({ mirrored: R.not })
        )(start, distance);
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
        return R.ifElse(even, this._getEvenPathShape.bind(this), this._getOddPathShape.bind(this))(start, distance);
    }
    render() {
        let { type, mirrored, rotation } = this._getPathShape(...this.props.ports);
        let svgPaths = PATH_SVG_DATA[type];
        let transform = `rotate(${rotation} 375 375)`;
        if (mirrored) {
            transform += ' scale(-1 1) translate(-750, 0)';
        }
        return <svg version="1.1" viewBox="0 0 750 750">
            <g className="pathContainer" transform={transform}>
                {svgPaths.map(function drawSVGPath(svgPath) {
                    return <path key={svgPath.d} {...svgPath} />;
                })}
            </g>
        </svg>;
    }
}

module.exports = Path;
