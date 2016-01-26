module Deck (Deck, Action(..), view) where

import Html exposing (Html)
import Field


---- MODEL ----


type alias Deck =
    Field.Field



---- UPDATE ----


type Action
    = Draw



---- VIEW ----


view : Signal.Address Action -> Deck -> Html
view address deck =
    let
        fieldAddress : Signal.Address ()
        fieldAddress =
            Signal.forwardTo address (\_ -> Draw)
    in
        Field.view fieldAddress deck
