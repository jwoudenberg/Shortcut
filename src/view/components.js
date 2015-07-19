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
                type: 'move_card',
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
        let { rotation, field, selected } = this.props;
        let didRotationChange = (rotation !== nextProps.rotation);
        let didFieldChange = (field.id !== nextProps.field.id);
        let isNewlySelected = (selected === false && nextProps.selected === true);
        if (didRotationChange || didFieldChange || isNewlySelected) {
            this.putOnTop();
        }
    }
    //Ensure that in a possible rendering and transition as a result of this event, this is the topmost element.
    putOnTop() {
        let isOnTop = (this.zIndex === topZIndex);
        if (!isOnTop) {
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
            type: 'take_card'
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
        this.state = props.world() || {};
        super(props);
    }
    componentDidMount() {
        let { world, actions } = this.props;
        flyd.on(worldState => this.setState({ worldState }), world);
        flyd.on(this.handleAction.bind(this), actions);
    }
    handleAction(action) {
        if (action.type === 'add_card') {
            this.selectCard(action.card.id);
        }
    }
    handleUIEvent(event) {
        if (event.type === 'select_card') {
            this.selectCard(event.cardId);
        }
    }
    selectCard(cardId) {
        this.setState({
            selectedCardId: cardId
        });
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
