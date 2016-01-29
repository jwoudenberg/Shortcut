module Deck (Deck(..), Action(..), field, view) where

import Html exposing (Html)
import Field exposing (Field(..))


---- MODEL ----


type Deck
    = Deck Field


field : Deck -> Field
field (Deck field') =
    field'



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
        Field.view fieldAddress (field deck)
