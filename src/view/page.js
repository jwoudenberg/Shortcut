const React = require('react');
var R = require('ramda');
const uiEventStream = require('./ui-event-stream');

class GameCreator extends React.Component {
    constructor() {
        //TODO: Consider moving state out of this component.
        this.state = {
            numberOfPlayers: 2,
            boardSize: 4
        };
    }
    handleBoardSizeChange(event) {
        let boardSize = parseInt(event.target.value);
        if (Number.isNaN(boardSize) || boardSize < 2) {
            return null;
        }
        this.setState({ boardSize });
        this.sendCreateGameEvent();
    }
    handleNumberOfPlayersChange(event) {
        let numberOfPlayers = parseInt(event.target.value);
        if (Number.isNaN(numberOfPlayers) || numberOfPlayers < 2) {
            return null;
        }
        this.setState({ numberOfPlayers });
        this.sendCreateGameEvent();
    }
    sendCreateGameEvent() {
        let gameEvent = R.merge(this.state, {
            action: 'create_game'
        });
        uiEventStream.emit(gameEvent);
    }
    render() {
        let { numberOfPlayers, boardSize } = this.state;
        return <form className="game-creator navbar-form navbar-left" role="create-game">
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-addon">Players:</div>
                    <input className="form-control" name="numberOfPlayers" min="2" type="number"
                        value={numberOfPlayers} onChange={this.handleNumberOfPlayersChange.bind(this)}/>
                </div>
            </div>
            <div className="form-group">
                <div className="input-group">
                    <div className="input-group-addon">Board Size:</div>
                    <input className="form-control" name="boardSize" min="2" type="number" value={boardSize}
                        onChange={this.handleBoardSizeChange.bind(this)}/>
                </div>
            </div>
            <input name="start-game" type="button" className="btn btn-primary" value="Start Game" />
        </form>;
    }
}

module.exports = { GameCreator };
