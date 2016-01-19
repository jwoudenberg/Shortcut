module Shortcut (..) where

import Path.Model exposing (Edge(..))
import Card.Model exposing (..)
import Card.View
import Html exposing (Html)


main : Html
main =
    Card.View.cardElement testCardModel


testCardModel : Card
testCardModel =
    { paths =
        [ ( BottomLeft, TopRight )
        , ( BottomRight, RightBottom )
        , ( RightTop, LeftTop )
        , ( LeftBottom, TopLeft )
        ]
    }



---- UPDATE ----


type Action
    = Move
    | Turn
    | Draw
    | EndTurn
