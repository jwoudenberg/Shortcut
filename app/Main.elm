module Shortcut (..) where

import Signal
import Html exposing (Html)
import Board exposing (Board(..))
import Game exposing (Game(..))
import Deck exposing (Deck(..))
import Field exposing (Field(..))
import Base exposing (ID(..))


fieldSize : Int
fieldSize =
    100


boardSize : Int
boardSize =
    4


init : Game
init =
    Game
        { cards = []
        , board = Board.empty boardSize fieldSize
        , deck = Deck (Field { x = (boardSize + 1) * fieldSize, y = 0, size = fieldSize })
        , nextId = ID 1
        , selectedCardId = ID 0
        }


main : Signal Html
main =
    start
        { init = init
        , update = Game.update
        , view = Game.view
        }


start :
    { init : model
    , update : action -> model -> model
    , view : Signal.Address action -> model -> Html
    }
    -> Signal Html
start { init, update, view } =
    let
        actions =
            Signal.mailbox Nothing

        address =
            Signal.forwardTo actions.address Just

        update' maybeAction model =
            case maybeAction of
                Just action ->
                    update action model

                Nothing ->
                    model

        model =
            Signal.foldp update' init actions.signal
    in
        Signal.map (view address) model
