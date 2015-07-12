const React = require('react');
const Path = require('./path');
const uiEventStream = require('./ui-event-stream');

function makeStyle(row, col, fieldSize) {
    let style = {
        left: fieldSize * col + 'px',
        top: fieldSize * row + 'px',
        marginLeft: -col,
        marginTop: -row,
        width: fieldSize + 'px',
        height: fieldSize + 'px'
    };
    return style;
}

class Field extends React.Component {
    render() {
        let { row, col, fieldSize } = this.props;
        let style = makeStyle(row, col, fieldSize);
        return <div className="field" style={style} />;
    }
}

let topZIndex = 2;
class Card extends React.Component {
    static defaultProps() {
        return { paths: [], rotation: 0 };
    }
    handleClick(event) {
        event.stopPropagation();
        let gameEvent = {
            action: 'rotate_card',
            cardId: this.props.id
        };
        uiEventStream.emit(gameEvent);
        //Ensure that in a possible rendering and transition as a result of this event, this is the topmost element.
        if (this.zIndex !== topZIndex) {
            this.zIndex = ++topZIndex;
        }
    }
    render() {
        let { paths, rotation, field, fieldSize } = this.props;
        let { row, col } = field;
        let style = makeStyle(row, col, fieldSize);
        style.transform = `rotate(${rotation}deg)`;
        style.zIndex = this.zIndex || 1;
        return <div className="card" style={style} onClick={this.handleClick.bind(this)} >
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
        uiEventStream.emit(gameEvent);
    }
    render() {
        let fieldSize = this.props.fieldSize;
        let style = {
            width: fieldSize,
            height: fieldSize
        };
        return <div className="deck" style={style} onClick={this.handleClick} >
            {this.props.children}
        </div>;
    }
}

class Game extends React.Component {
    getFieldsById() {
        let fields = this.props.world.board.fields;
        return fields.reduce(function addFieldById(fields, field) {
            fields[field.id] = field;
            return fields;
        }, {});
    }
    render() {
        //TODO: make this size depend on the available screen area.
        let fieldSize = 100;
        let { board, cards } = this.props.world;
        let fields = board.fields;
        let fieldsById = this.getFieldsById();
        return <div className="game">
            <div className="fieldLayer">
                {fields.map(function printField(field) {
                    return <Field
                        key={field.id}
                        id={field.id}
                        col={field.col}
                        row={field.row}
                        fieldSize={fieldSize}
                    />;
                })}
            </div>
            <div className="cardLayer">
                {cards.map(function printField(card) {
                    let field = fieldsById[card.field];
                    return <Card
                        key={card.id}
                        id={card.id}
                        field={field}
                        paths={card.paths}
                        rotation={card.rotation}
                        fieldSize={fieldSize}
                    />;
                })}
            </div>
        </div>;
    }
}

module.exports = { Game };
