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

var Field = React.createClass({
    render: function render() {
        return <div style={{ width: '100px', height: '100px', border: '1px solid ' + this.props.color }}>
            {this.props.children}
        </div>;
    }
});

var Card = React.createClass({
    render: function render() {
        return <div>{this.props.text}</div>;
    }
});

var Board = React.createClass({
    render: function render() {
        var fields = this.props.fields;
        return (
            <div>
                {fields.map(function printField(field) {
                    return <Field key={field.id} color={field.color}><Card text={field.card} /></Field>;
                })}
            </div>
        );
    }
});

var Game = React.createClass({
    getInitialState: function getInitialState() {
        return world;
    },
    getFieldsWithCards: function getFieldsWithCards() {
        var cards = this.state.cards;
        var fieldsWithCards = R.map(addCardToField, this.state.board.fields);
        function addCardToField(field) {
            var card = R.find(R.propEq('field', field.id), cards);
            return R.assoc('card', card, field);
        }
        console.log(fieldsWithCards);
        return fieldsWithCards;
    },
    render: function render() {
        var fieldsWithCards = this.getFieldsWithCards();
        return <Board fields={fieldsWithCards} />;
    }
});

React.render(<Game />, document.getElementById('playground'));
