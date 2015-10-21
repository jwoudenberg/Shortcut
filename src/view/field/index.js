import React from 'react';
import './style.css';
import { Box } from '../base';

export default class Field extends Box {
    handleClick (event) {
        event.stopPropagation();
        const { data } = this.props;
        const { selectedCardId, events } = this.context;
        if (selectedCardId) {
            events({
                type: 'move_card',
                cardId: selectedCardId,
                fieldId: data.get('id')
            });
        }
    }
    render () {
        return <div className="shortcut-field shortcut-box"
                    style={this.getStyle()}
                    onClick={this.handleClick.bind(this)} />;
    }
}

Field.contextTypes = {
    ...Box.contextTypes,
    events: React.PropTypes.func.isRequired,
    selectedCardId: React.PropTypes.string
};
