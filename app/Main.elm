module Shortcut (..) where

import Signal
import Html exposing (Html)
import Card
import Board
import Game


init : Game.Game
init =
    { cards = [ Card.card ]
    , board = Board.empty 4 100
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
