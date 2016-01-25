module Board.View (boardElement) where

import Dict
import Html exposing (..)
import Html.Attributes exposing (..)
import Board.Model exposing (..)
import Field.View exposing (viewElement)
import Card.Update


boardElement : Signal.Address Card.Update.Action -> Board -> Html
boardElement address board =
    div
        [ class "shortcut-board"
        ]
        (List.map (viewElement address) (Dict.values board))
