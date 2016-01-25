module Game.Update (Action(..), update) where

import Game.Model exposing (Game)
import Card.Update
import Card.Model


type alias ID =
    Int


type Action
    = Act ID Card.Update.Action


update : Action -> Game -> Game
update gameAction game =
    let
        updateCard : Card.Model.Card -> Card.Model.Card
        updateCard card =
            case gameAction of
                Act id cardAction ->
                    if (card.id == id) then
                        Card.Update.update cardAction card
                    else
                        card
    in
        { game | cards = List.map updateCard game.cards }
