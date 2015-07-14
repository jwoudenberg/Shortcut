const React = require('react');
const Path = require('./path');
const flyd = require('flyd');
const classNames = require('classnames');
const uiEvents = require('./ui-event-stream');

function makeStyle(row, col, fieldSize) {
    let style = {
        left: (fieldSize - 1) * col,
        top: (fieldSize - 1) * row,
        width: fieldSize,
        height: fieldSize
    };
    return style;
}

class Field extends React.Component {
    handleClick(event) {
        event.stopPropagation();
        let { id, selectedCardId } = this.props;
        if (selectedCardId) {
            uiEvents({
                action: 'move_card',
                cardId: selectedCardId,
                fieldId: id
            });
        }
    }
    render() {
        let { row, col, fieldSize } = this.props;
        let style = makeStyle(row, col, fieldSize);
        return <div className="field"
                    style={style}
                    onClick={this.handleClick.bind(this)} />;
    }
}

let topZIndex = 2;
class Card extends React.Component {
    static defaultProps() {
        return { paths: [], rotation: 0 };
    }
    handleClick(event) {
        event.stopPropagation();
        let id = this.props.id;
        if (this.props.selected) {
            uiEvents({
                action: 'rotate_card',
                cardId: id
            });
        } else {
            uiEvents({
                action: 'select_card',
                cardId: id
            });
        }
        //Ensure that in a possible rendering and transition as a result of this event, this is the topmost element.
        if (this.zIndex !== topZIndex) {
            this.zIndex = ++topZIndex;
        }
    }
    render() {
        let { paths, rotation, field, fieldSize, selected } = this.props;
        let { row, col } = field;
        let style = makeStyle(row, col, fieldSize);
        style.transform = `rotate(${rotation}deg)`;
        style.zIndex = this.zIndex || 1;
        return <div className={classNames('card', { selected })}
                    style={style}
                    onClick={this.handleClick.bind(this)} >
            {paths.map(function drawPath(path) {
                let key = path.ports.join('-');
                return <Path key={key} {...path} />;
            })}
        </div>;
    }
}

class Deck extends React.Component {
    handleClick() {
        let gameEvent = {
            action: 'take_card'
        };
        uiEvents(gameEvent);
    }
    render() {
        let fieldSize = this.props.fieldSize;
        let style = {
            width: fieldSize,
            height: fieldSize
        };
        return <div className="deck"
                    style={style}
                    onClick={this.handleClick} >
            {this.props.children}
        </div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        flyd.on(this.handleUIEvent.bind(this), uiEvents);
        this.state = {};
        super(props);
    }
    handleUIEvent(event) {
        if (event.action === 'select_card') {
            this.setState({
                selectedCardId: event.cardId
            });
        }
    }
    getFieldsById() {
        let board = this.props.world.board || {};
        let fields = board.fields || [];
        return fields.reduce(function addFieldById(fields, field) {
            fields[field.id] = field;
            return fields;
        }, {});
    }
    render() {
        //TODO: make this size depend on the available screen area.
        let fieldSize = 100;
        let { board={}, cards=[] } = this.props.world;
        let fields = board.fields || [];
        let fieldsById = this.getFieldsById();
        let selectedCardId = this.state.selectedCardId;
        return <div className="game">
            {fields.map(function printField(field) {
                return <Field key={field.id}
                              id={field.id}
                              col={field.col}
                              row={field.row}
                              fieldSize={fieldSize}
                              selectedCardId={selectedCardId} />;
            })}
            {cards.map(function printField(card) {
                let field = fieldsById[card.field];
                let selected = (selectedCardId === card.id);
                return <Card key={card.id}
                             id={card.id}
                             field={field}
                             paths={card.paths}
                             rotation={card.rotation}
                             selected={selected}
                             fieldSize={fieldSize} />;
            })}
        </div>;
    }
}

module.exports = { Game };
