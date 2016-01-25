module Shortcut (..) where

import Signal
import Html exposing (Html)
import Card.Model
import Board.Model
import Game.Model
import Game.View
import Game.Update


init : Game.Model.Game
init =
    { cards = [ Card.Model.card ]
    , board = Board.Model.empty 4 100
    }


main : Signal Html
main =
    start
        { init = init
        , update = Game.Update.update
        , view = Game.View.gameElement
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
