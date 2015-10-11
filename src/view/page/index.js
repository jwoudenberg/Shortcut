import React from 'react';
import R from 'ramda';
import { Button, ButtonInput, Input, OverlayTrigger, Tooltip } from 'react-bootstrap';

export class GameCreator extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            boardSize: props.boardSize.default,
            playerName: '',
            boardSizeError: false
        };
        //Pass starting status.
        this.onStateUpdate();
    }
    handleBoardSizeChange (event) {
        const { min, max } = this.props.boardSize;
        const boardSize = parseInt(event.target.value);
        const boardSizeError = (Number.isNaN(boardSize) || boardSize < min || boardSize > max);
        this.setState({ boardSizeError });
        if (boardSizeError) {
            return;
        }
        this.setState({ boardSize }, this.onStateUpdate.bind(this));
    }
    handlePlayerNameChange (event) {
        const playerName = event.target.value;
        this.setState({ playerName });
    }
    handleAddPlayer () {
        const { playerName } = this.state;
        if (!playerName) {
            return null;
        }
        this.props.events({
            type: 'add_player',
            name: playerName
        });
        this.setState({ playerName: '' });
    }
    onStateUpdate () {
        const gameEvent = R.merge(this.state, {
            type: 'create_game'
        });
        this.props.events(gameEvent);
    }
    render () {
        const { boardSize, boardSizeError, playerName } = this.state;
        const boardSizeTooltip = <Tooltip id='board-size-tooltip'>Must be at least 2 and no larger than 10</Tooltip>;
        const addPlayerTooltip = <Tooltip id='add-player-tooltip'>Add a new player to the game.</Tooltip>;
        return <form className='game-creator navbar-form navbar-left' role='create-game'>
            <OverlayTrigger placement='bottom' overlay={boardSizeTooltip} delay={300}>
                <Input
                    type='number'
                    defaultValue={boardSize}
                    label='The size of the board in the new game.'
                    bsStyle={boardSizeError ? 'error' : undefined}
                    groupClassName='col-xs-4'
                    labelClassName='sr-only'
                    addonBefore='Board Size:'
                    onChange={::this.handleBoardSizeChange}
                />
            </OverlayTrigger>
            <OverlayTrigger placement='bottom' overlay={addPlayerTooltip} delay={300}>
                <Input
                    type='text'
                    value={playerName}
                    label='Adds a player to the game.'
                    placeholder='Player name'
                    groupClassName='col-xs-4'
                    labelClassName='sr-only'
                    buttonAfter={<Button onClick={::this.handleAddPlayer}>Add player</Button>}
                    onChange={::this.handlePlayerNameChange}
                />
            </OverlayTrigger>
            <ButtonInput
                type='button'
                standAlone
                bsStyle='primary'
                value='Start Game'
            />
        </form>;
    }
}
