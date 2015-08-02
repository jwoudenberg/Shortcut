import React from 'react';
import Field from './field';
import { uiEvents } from './base';

export default class Deck extends Field {
    handleClick(event) {
        event.stopPropagation();
        uiEvents({
            type: 'take_card'
        });
    }
    render() {
        const element = super.render();
        return React.cloneElement(
            element,
            { className: [element.props.className, 'deck'].join(' ') }
        );
    }
}
