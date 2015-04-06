const React = require('react');

class GameCreator extends React.Component {
    render() {

        return <form className="game-creator navbar-form navbar-left" role="create-game">
            <div className="form-group">
                <label className="sr-only" for="number-of-players">Number of players</label>
                <div className="input-group">
                    <div className="input-group-addon">Players:</div>
                    <input className="form-control" name="number-of-players" min="2" type="number" value="2" />
                </div>
            </div>
            <div className="form-group">
                <label className="sr-only" for="board-size">Board size</label>
                <div className="input-group">
                    <div className="input-group-addon">Board Size:</div>
                    <input className="form-control" name="board-size" min="2" type="number" value="4" />
                </div>
            </div>
            <input name="start-game" type="button" className="btn btn-primary" value="Start Game" />
        </form>;
    }
}

module.exports = { GameCreator };
