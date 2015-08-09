import React from 'react';
import classNames from 'classnames';
import './style.css';
import { uiEvents } from '../';
import { Box } from '../base';
import Path from '../path';

let topZIndex = 2;
export default class Card extends Box {
    static defaultProps() {
        return { paths: [], rotation: 0 };
    }
    handleClick(event) {
        event.stopPropagation();
        const id = this.props.id;
        if (this.props.selected) {
            uiEvents({
                type: 'rotate_card',
                cardId: id
            });
        } else {
            uiEvents({
                type: 'select_card',
                cardId: id
            });
        }
    }
    componentWillReceiveProps(nextProps) {
        const { rotation, field, selected } = this.props;
        const didRotationChange = (rotation !== nextProps.rotation);
        const didFieldChange = (field !== nextProps.field);
        const isNewlySelected = (selected === false && nextProps.selected === true);
        if (didRotationChange || didFieldChange || isNewlySelected) {
            this.putOnTop();
        }
    }
    //Ensure that in a possible rendering and transition as a result of this event, this is the topmost element.
    putOnTop() {
        const isOnTop = (this.zIndex === topZIndex);
        if (!isOnTop) {
            this.zIndex = ++topZIndex;
        }
    }
    render() {
        const { paths, rotation, selected, id } = this.props;
        const style = this.getStyle();
        style.transform = `rotate(${rotation}deg)`;
        style.zIndex = this.zIndex || 1;
        return <div className='shortcut-card-wrapper shortcut-box'
                    style={style} >
            <div className={classNames('shortcut-card', 'shortcut-box', { selected })}
                onClick={this.handleClick.bind(this)} >
                <div className='shortcut-card-front shortcut-box'>
                    {paths.map(function drawPath(path, index) {
                        return <Path
                            {...path}
                            id={{ cardId: id, pathIndex: index }}
                            key={[id, index].join()}
                        />;
                    })}
                </div>
                <div className='shortcut-card-back shortcut-box'>
                    Awesome Background!
                </div>
            </div>
        </div>;
    }
}
