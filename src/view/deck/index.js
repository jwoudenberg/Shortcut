import React from 'react';
import Field from '../field';

export default class Deck extends Field {
    handleClick (event) {
        event.stopPropagation();
        this.context.events({
            type: 'take_card'
        });
    }
    render () {
        const element = super.render();
        return React.cloneElement(
            element,
            { className: [element.props.className, 'shortcut-deck'].join(' ') }
        );
    }
}

Deck.contextTypes = {
    events: React.PropTypes.func.isRequired
};
