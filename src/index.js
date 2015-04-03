var React = require('react');
var R = require('ramda');

//TODO: replace constant world object with real one.
var world = require('./world.mock');

class Field extends React.Component {
    render() {
        return <div className="field"
                    style={{ width: '100px', height: '100px', border: '1px solid ' + this.props.color }}>
            {this.props.children}
        </div>;
    }
}

class Card extends React.Component {
    static defaultProps() {
        return { paths: [] };
    }
    render() {
        var paths = this.props.paths;
        return <div className="card">
            {paths.map(function drawPath(path) {
                var key = [path.begin, path.end].join('-');
                return <Path key={key} {...path} />;
            })}
        </div>;
    }
}

var PATH_SVG_DATA = require('./pathSVGData');
class Path extends React.Component {
    render() {
        //TODO: calculate pathShape based on begin and end props.
        var pathShape = 'u_turn';
        var svgPaths = PATH_SVG_DATA[pathShape];
        return <svg version="1.1" viewBox="0 0 750 750">
            <g className="pathContainer">
                {svgPaths.map(function drawSVGPath(svgPath) {
                    return <path key={svgPath.d} {...svgPath} />;
                })}
            </g>
        </svg>;
    }
}

class Board extends React.Component {
    render() {
        var fields = this.props.fields;
        return (
            <div className="board">
                {fields.map(function printField(field) {
                    var card = field.card;
                    return <Field key={field.id} color={field.color}>
                        <Card paths={card.paths} />
                    </Field>;
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
        return fieldsWithCards;
    }
    render() {
        var fieldsWithCards = this.getFieldsWithCards();
        return <Board fields={fieldsWithCards} />;
    }
}

React.render(<Game />, document.getElementById('playground'));
