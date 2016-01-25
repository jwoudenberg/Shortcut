module Game.View (gameElement) where

import Html exposing (..)
import Html.Attributes exposing (..)
import Game.Model exposing (..)
import Game.Update
import Board.View exposing (boardElement)
import Card.View exposing (cardElement)
import Card.Model


gameElement : Signal.Address Game.Update.Action -> Game -> Html
gameElement address game =
    let
        renderCard : Card.Model.Card -> Html
        renderCard card =
            cardElement (Signal.forwardTo address (Game.Update.Act card.id)) card
    in
        div
            [ class "shortcut-game"
            ]
            [ boardElement (Signal.forwardTo address (Game.Update.Act 4)) game.board
            , div
                []
                (List.map renderCard game.cards)
            ]
