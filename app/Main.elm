module Shortcut (..) where

import Signal
import Html exposing (Html)
import Card.Update
import Card.Model
import Card.View


main : Signal Html
main =
    start
        { init = Card.Model.card
        , update = Card.Update.update
        , view = Card.View.cardElement
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
