import React from 'react';
import './style.css';
import { Box } from '../base';

export default class Field extends Box {
    handleClick (event) {
        event.stopPropagation();
        const { id, selectedCardId } = this.props;
        if (selectedCardId) {
            this.context.events({
                type: 'move_card',
                cardId: selectedCardId,
                fieldId: id
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
    events: React.PropTypes.func.isRequired
};
