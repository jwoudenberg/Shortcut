import React from 'react';
import R from 'ramda';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import PATH_SVG_DATA from './pathSVGData';
import './style.css';

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

export default class Path extends React.Component {
    _getEvenPathShape (start, distance) {
        let addDefaults = R.merge({
            type: null,
            rotation: 0,
            transforms: []
        });
        let shape = addDefaults(PATH_DISTANCE_TO_SHAPE_MAP[distance]);
        return shape;
    }
    _getOddPathShape (start, distance) {
        //Odd ports (1,3,5,7) will use mirror images of even ports (0,2,4,6)
        distance = -distance;
        let shape = R.pipe(
            this._getEvenPathShape.bind(this),
            R.evolve({ transforms: R.append({ mirror: true })})
        )(start, distance);
        return shape;
    }
    _getPathShape (port1, port2) {
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
    _getTransformString (transform) {
        let [type, amount] = R.toPairs(transform)[0];
        let transformString = R.cond([
            [R.identical('rotate'), (_type, rotation) => `rotate(${rotation} 375 375)`],
            [R.identical('mirror'), () => 'scale(-1 1) translate(-750, 0)'],
            [R.T, (_type) => { throw new Error(`Unknown transform type ${_type}`); }]
        ])(type, amount);
        return transformString;
    }
    render () {
        const { data } = this.props;
        const ports = data.get('ports');
        const color = data.get('color');
        let { type, transforms } = this._getPathShape(...ports.toJS());
        //TODO: Replace json data for path type with component per path type.
        let svgPaths = PATH_SVG_DATA[type];
        let transformAttr = transforms.reverse().map(this._getTransformString).join(' ');
        let style = {
            stroke: color,
            fill: color
        };
        const baseIndicator = this.renderBaseIndicator();
        return <div className="shortcut-path shortcut-box">
            {baseIndicator}
            <svg version="1.1" viewBox="0 0 750 750">
                <g
                    className="shortcut-path-container"
                    transform={transformAttr}
                >
                    {svgPaths.map(function drawSVGPath (svgPath) {
                        return <path key={svgPath.d} style={style} {...svgPath} />;
                    })}
                </g>
            </svg>
        </div>;
    }
    renderBaseIndicator () {
        const { data } = this.props;
        const ports = data.get('ports');
        const baseFor = data.get('baseFor');
        if (!baseFor) {
            return null;
        }
        const port = ports.first();
        const position = {
            0: { top: 0, left: 0 },
            1: { top: 0, right: 0 },
            2: { bottom: 0, left: 0 },
            3: { top: 0, left: 0 },
            4: { bottom: 0, right: 0 },
            5: { bottom: 0, left: 0 },
            6: { top: 0, right: 0 },
            7: { bottom: 0, right: 0 }
        }[port];
        const firstLetter = baseFor.charAt(0).toUpperCase();
        const margin = 10;
        const badgeStyle = R.merge({
            position: 'absolute',
            width: `calc(50% - ${margin * 2}px)`,
            height: `calc(50% - ${margin * 2}px)`,
            border: '1px solid',
            margin: margin,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            opacity: 0.6
        }, position);
        const fullPlayerNameTooltip = <Tooltip id='full-player-name'>{baseFor}</Tooltip>;
        return (
            <OverlayTrigger placement='bottom' overlay={fullPlayerNameTooltip} delay={300}>
                <div style={badgeStyle}>
                    <strong>{firstLetter}</strong>
                </div>
            </OverlayTrigger>
        );
    }
}
