const React = require('react');
const Path = require('./path');
const flyd = require('flyd');
const R = require('ramda');
const classNames = require('classnames');
const uiEvents = require('./').uiEvents;
//DEBUG: temporarily linking directly to engine file. This should be replaced by sending an event through uiEvents.
const findRoute = require('../engine/find-route');

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
        let { paths, rotation, field, fieldSize, selected, id } = this.props;
        let { row, col } = field;
        let style = makeStyle(row, col, fieldSize);
        style.transform = `rotate(${rotation}deg)`;
        style.zIndex = this.zIndex || 1;
        return <div className={classNames('card', { selected })}
                    style={style}
                    onClick={this.handleClick.bind(this)} >
            {paths.map(function drawPath(path, index) {
                return <Path
                    {...path}
                    id={{ cardId: id, pathIndex: index }}
                    key={[id, index].join()}
                />;
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
        this.state = props.world() || {};
        //TODO: make this size depend on the available screen area.
        this.state.fieldSize = 100;
        super(props);
    }
    componentDidMount() {
        //TODO: account for change in this.props and unmounting.
        let { world, actions } = this.props;
        flyd.on(worldState => this.setState({ worldState }), world);
        flyd.on(this.handleAction.bind(this), actions);
        flyd.on(this.handleUIEvent.bind(this), uiEvents);
    }
    handleAction(action) {
        if (action.type === 'add_card') {
            this.selectCard(action.card.id);
        }
    }
    handleUIEvent(event) {
        //TODO: create an event-type enum.
        if (event.type === 'select_card') {
            this.selectCard(event.cardId);
        } else if (event.type === 'show_route') {
            let route = findRoute(event.pathId, this.state.worldState || {});
            this.setState({ routes: [route] });
        }
    }
    selectCard(cardId) {
        this.setState({
            selectedCardId: cardId
        });
    }
    shiftFields(shift, fields) {
        let evolver = R.mapObj((shiftAmount) => R.add(shiftAmount), shift);
        return fields.map(R.evolve(evolver));
    }
    render() {
        let { worldState={}, routes=[] } = this.state;
        let { board={}, cards=[] } = worldState;
        let { fields=[] } = board;
        let deck = { col: 0, row: 0 };
        let shiftedFields = this.shiftFields({ col: 2 }, fields);
        //Create an optimized way to lookup fields by id.
        let fieldsById = R.fromPairs(shiftedFields.map((field) => [field.id, field]));
        let getFieldById = (fieldId) => fieldsById[fieldId] || deck;

        //Create an optimized way to lookup path color based on the path a route (might) be in.
        //DEBUG: quick and dirty color map. Replace with randomized nicer colors
        const colors = {
            '-1': null,
            '0': 'red',
            '1': 'blue',
            '2': 'green'
        };
        //DEBUG: quick test implementation, not very performant.
        console.log(routes);
        let getColorByPathId = R.pipe(
            (pathId) => R.findIndex(R.containsWith(R.whereEq, pathId), routes),
            R.nth(R.__, colors)
        );

        return <div className="game">
            {this.renderDeck(deck)}
            {shiftedFields.map(function printField(field) {
                return this.renderField(field);
            }, this)}
            {cards.map(function printField(card) {
                return this.renderCard(getFieldById, getColorByPathId, card);
            }, this)}
        </div>;
    }
    renderDeck(deck) {
        return <Deck
            {...deck}
            fieldSize={this.state.fieldSize}
        />;
    }
    renderField(field) {
        let { selectedCardId, fieldSize } = this.state;
        return <Field
            {...field}
            key={field.id}
            fieldSize={fieldSize}
            selectedCardId={selectedCardId}
        />;
    }
    renderCard(getFieldById, getColorByPathId, card) {
        let { selectedCardId, fieldSize } = this.state;
        let { cardId } = card;
        let colouredPaths = (card.paths || []).map((path, index) => {
            let color = getColorByPathId({ cardId, pathIndex: index });
            return R.assoc('color', color, path);
        });
        let extendedCard = R.merge(card, {
            key: card.id,
            paths: colouredPaths,
            field: getFieldById(card.field),
            selected: (selectedCardId === card.id),
            fieldSize
        });
        return <Card {...extendedCard} />;
    }
}

module.exports = { Game };
