import { is } from 'immutable';
import React from 'react';
import './style.css';

/* An abstract Box class from which Card and Field inherit. */
export class Box extends React.Component {
    shouldComponentUpdate ({ data: nextData }) {
        const { data } = this.props;
        return !is(data, nextData);
    }
    getStyle () {
        const { fieldSize } = this.context;
        const { data } = this.props;
        const style = {
            left: (fieldSize - 1) * data.get('col'),
            top: (fieldSize - 1) * data.get('row'),
            width: fieldSize,
            height: fieldSize
        };
        return style;
    }
}

Box.contextTypes = {
    fieldSize: React.PropTypes.number.isRequired
};
