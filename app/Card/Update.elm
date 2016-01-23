module Card.Update (Action(..), update) where

import Card.Model exposing (Card)


type Action
    = Rotate


update : Action -> Card -> Card
update action card =
    case action of
        Rotate ->
            { card | rotation = card.rotation + 1 }
