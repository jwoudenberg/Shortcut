const React = require('react');
const R = require('ramda');
const Path = require('./path');

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
    render() {
        let { paths, rotation } = this.props;
        let style = {
            transform: `rotate(${rotation}deg)`
        };
        return <div className="card" style={style}>
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
        //TODO: make this size depend on the available screen area.
        let style = {
            width: '100px',
            height: '100px'
        };
        return (
            <div className="board" style={style}>
                {fields.map(function printField(field) {
                    let {card, row, col} = field;
                    let cardJSX = card ? <Card paths={card.paths} rotation={card.rotation} /> : '';
                    return <Field key={field.id} col={col} row={row}>{cardJSX}</Field>;
                })}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.world;
    }
    getFieldsWithCards() {
        let cards = this.state.cards;
        let fieldsWithCards = R.map(addCardToField, this.state.board.fields);
        function addCardToField(field) {
            let card = R.find(R.propEq('field', field.id), cards);
            return R.assoc('card', card, field);
        }
        return fieldsWithCards;
    }
    render() {
        let fieldsWithCards = this.getFieldsWithCards();
        return <Board fields={fieldsWithCards} />;
    }
}

module.exports = { Game, Board, Field, Card };
