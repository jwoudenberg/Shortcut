const React = require('react');
const R = require('ramda');
const Path = require('./path');
const uiEventStream = require('./ui-event-stream');

class Field extends React.Component {
    render() {
        let {row, col} = this.props;
        let style = {
            left: 100 * col + '%',
            top: 100 * row + '%',
            marginLeft: -col,
            marginTop: -row
        };
        return <div className="field" style={style}>
            {this.props.children}
        </div>;
    }
}

class Card extends React.Component {
    static defaultProps() {
        return { paths: [], rotation: 0 };
    }
    handleClick(event) {
        let gameEvent = {
            action: 'rotate_card',
            cardId: this.props.id
        };
        uiEventStream.emit(gameEvent);
        event.stopPropagation();
    }
    render() {
        let { paths, rotation } = this.props;
        let style = {
            transform: `rotate(${rotation}deg)`
        };
        return <div className="card" style={style} onClick={this.handleClick.bind(this)} >
            {paths.map(function drawPath(path) {
                let key = path.ports.join('-');
                return <Path key={key} {...path} />;
            })}
        </div>;
    }
}

class Board extends React.Component {
    render() {
        let fields = this.props.fields;
        let fieldSize = this.props.fieldSize;
        let style = {
            width: fieldSize,
            height: fieldSize
        };
        return (
            <div className="board" style={style}>
                {fields.map(function printField(field) {
                    let {card, row, col} = field;
                    let cardJSX = card ? <Card {...card} /> : '';
                    return <Field key={field.id} col={col} row={row}>{cardJSX}</Field>;
                })}
            </div>
        );
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
    getFieldsWithCards() {
        let world = this.props.world;
        let cards = world.cards;
        let fieldsWithCards = R.map(addCardToField, world.board.fields);
        function addCardToField(field) {
            let card = R.find(R.propEq('field', field.id), cards);
            return R.assoc('card', card, field);
        }
        return fieldsWithCards;
    }
    getDeckCard() {
        let cards = this.props.world.cards;
        let card = R.find(card => R.isNil(card.field), cards);
        return card;
    }
    render() {
        //TODO: make this size depend on the available screen area.
        let fieldSize = '100px';
        let fieldsWithCards = this.getFieldsWithCards();
        let deckCard = this.getDeckCard();
        let deckCardJSX = deckCard ? <Card {...deckCard} /> : '';
        return <div className="row">
            <div className="col-md-1">
                <Deck fieldSize={fieldSize} >{deckCardJSX}</Deck>
            </div>
            <div className="col-md-11">
                <Board fields={fieldsWithCards} fieldSize={fieldSize} />
            </div>
        </div>;
    }
}

module.exports = { Game, Board, Field, Card };
