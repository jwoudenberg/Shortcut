const React = require('react');
const Path = require('./path');
const flyd = require('flyd');
const R = require('ramda');
const classNames = require('classnames');
const uiEvents = require('./').uiEvents;

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

class Deck extends Field {
    handleClick(event) {
        event.stopPropagation();
        uiEvents({
            action: 'take_card'
        });
    }
    render() {
        var element = super.render();
        return React.cloneElement(
            element,
            { className: [element.props.className, 'deck'].join(' ') }
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        flyd.on(this.handleUIEvent.bind(this), uiEvents);
        this.state = props.world();
        super(props);
    }
    componentDidMount() {
        let world = this.props.world;
        flyd.on(worldState => this.setState({ worldState }), world);
    }
    handleUIEvent(event) {
        if (event.action === 'select_card') {
            this.setState({
                selectedCardId: event.cardId
            });
        }
    }
    getFieldsById(fields) {
        return fields.reduce(function addFieldById(fields, field) {
            fields[field.id] = field;
            return fields;
        }, {});
    }
    render() {
        //TODO: make this size depend on the available screen area.
        let fieldSize = 100;
        let { worldState={}, selectedCardId } = this.state;
        let { board={}, cards=[] } = worldState;
        //Move all fields two to the right, to make space for the deck.
        let fields = (board.fields || []).map(R.evolve({ col: R.add(2) }));
        let fieldsById = this.getFieldsById(fields);
        let deck = {
            id: 'deck',
            col: 0,
            row: 0
        };
        return <div className="game">
            <Deck {...deck}
                  fieldSize={fieldSize} />
            {fields.map(function printField(field) {
                return <Field {...field}
                              key={field.id}
                              fieldSize={fieldSize}
                              selectedCardId={selectedCardId} />;
            })}
            {cards.map(function printField(card) {
                let extendedCard = R.merge(card, {
                    key: card.id,
                    field: fieldsById[card.field] || deck,
                    selected: (selectedCardId === card.id),
                    fieldSize
                });
                return <Card {...extendedCard} />;
            })}
        </div>;
    }
}

module.exports = { Game };
