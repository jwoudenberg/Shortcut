const React = require('react/addons');
const R = require('ramda');
const uiEventStream = require('./ui-event-stream');
const OverlayTrigger = require('react-bootstrap').OverlayTrigger;
const Tooltip = require('react-bootstrap').Tooltip;

class GameCreator extends React.Component {
    constructor(props) {
        this.state = {
            numberOfPlayers: props.numberOfPlayers.default,
            boardSize: props.boardSize.default,
            boardSizeError: false,
            numberOfPlayersError: false
        };
    }
    handleBoardSizeChange(event) {
        let { min, max } = this.props.boardSize;
        let boardSize = parseInt(event.target.value);
        let boardSizeError = (Number.isNaN(boardSize) || boardSize < min || boardSize > max);
        this.setState({ boardSizeError });
        if (boardSizeError) {
            return;
        }
        this.setState({ boardSize }, this.onStateUpdate.bind(this));
    }
    handleNumberOfPlayersChange(event) {
        let { min } = this.props.numberOfPlayers;
        let numberOfPlayers = parseInt(event.target.value);
        let numberOfPlayersError = (Number.isNaN(numberOfPlayers) || numberOfPlayers < min);
        this.setState({ numberOfPlayersError });
        if (numberOfPlayersError) {
            return;
        }
        this.setState({ numberOfPlayers }, this.onStateUpdate.bind(this));
    }
    onStateUpdate() {
        let gameEvent = R.merge(this.state, {
            action: 'create_game'
        });
        uiEventStream.emit(gameEvent);
    }
    render() {
        let cx = React.addons.classSet;
        let { numberOfPlayers, boardSize, numberOfPlayersError, boardSizeError } = this.state;
        let boardSizeTooltip = <Tooltip>Must be at least 2 and no larger than 10</Tooltip>;
        let numberOfPlayersTooltip = <Tooltip>Must be at least 2</Tooltip>;
        return <form className="game-creator navbar-form navbar-left" role="create-game">
            <div className={cx({ 'input-group': true, 'col-xs-3': true, 'has-error': numberOfPlayersError })}>
                <div className="input-group-addon">Players:</div>
                <OverlayTrigger placement="bottom" overlay={numberOfPlayersTooltip}>
                    <input className="form-control" name="numberOfPlayers" type="number"
                        defaultValue={numberOfPlayers} onChange={this.handleNumberOfPlayersChange.bind(this)}/>
                </OverlayTrigger>
            </div>
            <div className={cx({ 'input-group': true, 'col-xs-3': true, 'has-error': boardSizeError })}>
                <div className="input-group-addon">Board Size:</div>
                <OverlayTrigger placement="bottom" overlay={boardSizeTooltip}>
                    <input className="form-control" name="boardSize" type="number" defaultValue={boardSize}
                        onChange={this.handleBoardSizeChange.bind(this)}/>
                </OverlayTrigger>
            </div>
            <input name="start-game" type="button" className="btn btn-primary" value="Start Game" />
        </form>;
    }
}

module.exports = { GameCreator };
