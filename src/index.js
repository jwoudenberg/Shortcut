var React = require('react');
var R = require('ramda');

var world = {
    board: {
        fields: [{
            id: '1',
            color: 'red'
        }, {
            id: '2',
            color: 'blue'
        }, {
            id: '3',
            color: 'black'
        }]
    },
    cards: [{
        text: 'foo',
        field: '1'
    }, {
        text: 'bar',
        field: '2'
    }, {
        text: 'hi',
        field: '3'
    }]
};

class Field extends React.Component {
    render() {
        return <div style={{ width: '100px', height: '100px', border: '1px solid ' + this.props.color }}>
            {this.props.children}
        </div>;
    }
}

class Card extends React.Component {
    render() {
        return <div>{this.props.text}</div>;
    }
}

class Board extends React.Component {
    render() {
        var fields = this.props.fields;
        return (
            <div>
                {fields.map(function printField(field) {
                    return <Field key={field.id} color={field.color}><Card text={field.card} /></Field>;
                })}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = world;
    }
    getFieldsWithCards() {
        var cards = this.state.cards;
        var fieldsWithCards = R.map(addCardToField, this.state.board.fields);
        function addCardToField(field) {
            var card = R.find(R.propEq('field', field.id), cards);
            return R.assoc('card', card, field);
        }
        console.log(fieldsWithCards);
        return fieldsWithCards;
    }
    render() {
        var fieldsWithCards = this.getFieldsWithCards();
        return <Board fields={fieldsWithCards} />;
    }
}

React.render(<Game />, document.getElementById('playground'));
