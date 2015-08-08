import React from 'react';
import R from 'ramda';
import { Input, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { uiEvents } from '../base';

export class GameCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numberOfPlayers: props.numberOfPlayers.default,
            boardSize: props.boardSize.default,
            boardSizeError: false,
            numberOfPlayersError: false
        };
        //Pass starting status.
        this.onStateUpdate();
    }
    handleBoardSizeChange(event) {
        const { min, max } = this.props.boardSize;
        const boardSize = parseInt(event.target.value);
        const boardSizeError = (Number.isNaN(boardSize) || boardSize < min || boardSize > max);
        this.setState({ boardSizeError });
        if (boardSizeError) {
            return;
        }
        this.setState({ boardSize }, this.onStateUpdate.bind(this));
    }
    handleNumberOfPlayersChange(event) {
        const { min } = this.props.numberOfPlayers;
        const numberOfPlayers = parseInt(event.target.value);
        const numberOfPlayersError = (Number.isNaN(numberOfPlayers) || numberOfPlayers < min);
        this.setState({ numberOfPlayersError });
        if (numberOfPlayersError) {
            return;
        }
        this.setState({ numberOfPlayers }, this.onStateUpdate.bind(this));
    }
    onStateUpdate() {
        const gameEvent = R.merge(this.state, {
            type: 'create_game'
        });
        uiEvents(gameEvent);
    }
    render() {
        const { numberOfPlayers, boardSize, numberOfPlayersError, boardSizeError } = this.state;
        const boardSizeTooltip = <Tooltip>Must be at least 2 and no larger than 10</Tooltip>;
        const numberOfPlayersTooltip = <Tooltip>Must be at least 2</Tooltip>;
        return <form className="game-creator navbar-form navbar-left" role="create-game">
            <OverlayTrigger placement="bottom" overlay={numberOfPlayersTooltip}>
                <Input
                    type='number'
                    defaultValue={numberOfPlayers}
                    label='The number of players in the new game.'
                    bsStyle={numberOfPlayersError ? 'error' : undefined}
                    groupClassName='col-xs-4'
                    labelClassName='sr-only'
                    addonBefore='Players:'
                    onChange={this.handleNumberOfPlayersChange.bind(this)}
                />
            </OverlayTrigger>
            <OverlayTrigger placement="bottom" overlay={boardSizeTooltip}>
                <Input
                    type='number'
                    defaultValue={boardSize}
                    label='The size of the board in the new game.'
                    bsStyle={boardSizeError ? 'error' : undefined}
                    groupClassName='col-xs-4'
                    labelClassName='sr-only'
                    addonBefore='Board Size:'
                    onChange={this.handleBoardSizeChange.bind(this)}
                />
            </OverlayTrigger>
            <Input
                type='button'
                standAlone
                className='btn btn-primary'
                value='Start Game'
            />
        </form>;
    }
}
