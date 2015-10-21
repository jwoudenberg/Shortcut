import React from 'react';
import classNames from 'classnames';
import { Set } from 'immutable';
import './style.css';
import { Box } from '../base';
import Path from '../path';

let topZIndex = 2;
export default class Card extends Box {
    handleClick (event) {
        event.stopPropagation();
        const { data } = this.props;
        const id = data.get('id');
        const selected = data.get('selected');
        const { events } = this.context;
        if (selected) {
            events({
                type: 'rotate_card',
                cardId: id
            });
        } else {
            events({
                type: 'select_card',
                cardId: id
            });
        }
    }
    componentWillReceiveProps (nextProps) {
        const { data } = this.props;
        const { data: nextData } = nextProps;
        const didRotationChange = (data.get('rotation') !== nextData.get('rotation'));
        const didFieldChange = (data.get('field') !== nextData.get('field'));
        const isNewlySelected = (data.get('selected') === false && nextData.get('selected') === true);
        if (didRotationChange || didFieldChange || isNewlySelected) {
            this.putOnTop();
        }
    }
    //Ensure that in a possible rendering and transition as a result of this event, this is the topmost element.
    putOnTop () {
        const isOnTop = (this.zIndex === topZIndex);
        if (!isOnTop) {
            this.zIndex = ++topZIndex;
        }
    }
    render () {
        const { data } = this.props;
        const style = this.getStyle();
        style.transform = `rotate(${data.get('rotation')}deg)`;
        style.zIndex = this.zIndex || 1;
        return <div className={classNames('shortcut-card', 'shortcut-box', { selected: data.get('selected') })}
                    style={style}
                    onClick={this.handleClick.bind(this)} >
            {data.get('paths', Set()).map(function drawPath (path) {
                const pathId = path.get('id');
                return <Path
                    data={path}
                    key={pathId}
                />;
            })}
        </div>;
    }
}

Card.contextTypes = {
    ...Box.contextTypes,
    events: React.PropTypes.func.isRequired
};
