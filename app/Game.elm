module Game (Game, update, view) where

import Html exposing (..)
import Html.Attributes exposing (..)
import Board exposing (Board)
import Card exposing (Card)


---- MODEL ----


type alias Game =
    { board : Board
    , cards : List Card
    }



---- UPDATE ----


type alias ID =
    Int


type Action
    = Act ID Card.Action


update : Action -> Game -> Game
update gameAction game =
    let
        updateCard : Card.Card -> Card.Card
        updateCard card =
            case gameAction of
                Act id cardAction ->
                    if (card.id == id) then
                        Card.update cardAction card
                    else
                        card
    in
        { game | cards = List.map updateCard game.cards }



---- VIEW ----


view : Signal.Address Action -> Game -> Html
view address game =
    let
        renderCard : Card.Card -> Html
        renderCard card =
            Card.view (Signal.forwardTo address (Act card.id)) card
    in
        div
            [ class "shortcut-game"
            ]
            [ Board.view (Signal.forwardTo address (Act 4)) game.board
            , div
                []
                (List.map renderCard game.cards)
            ]
