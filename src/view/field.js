import React from 'react';
import { Box, uiEvents } from './base';

export default class Field extends Box {
    handleClick(event) {
        event.stopPropagation();
        const { id, selectedCardId } = this.props;
        if (selectedCardId) {
            uiEvents({
                type: 'move_card',
                cardId: selectedCardId,
                fieldId: id
            });
        }
    }
    render() {
        return <div className="field"
                    style={this.getStyle()}
                    onClick={this.handleClick.bind(this)} />;
    }
}
