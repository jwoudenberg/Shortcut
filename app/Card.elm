module Card (Card, Action(..), card, view, update) where

import Path.Main as Path exposing (Path, Edge(..))
import Signal
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)


---- MODEL ----


type alias Rotation =
    Int


type alias Card =
    { paths : List Path
    , rotation : Rotation
    , id : Int
    }


card : Card
card =
    { paths =
        [ ( BottomLeft, TopRight )
        , ( BottomRight, RightBottom )
        , ( RightTop, LeftTop )
        , ( LeftBottom, TopLeft )
        ]
    , rotation = 0
    , id = 0
    }



---- UPDATE ----


type Action
    = Rotate
    | Move


update : Action -> Card -> Card
update action card =
    case action of
        Rotate ->
            { card | rotation = card.rotation + 1 }

        Move ->
            card



---- VIEW ----


view : Signal.Address Action -> Card -> Html
view address card =
    let
        transformString angle =
            "rotate(" ++ toString (angle * 90) ++ "deg)"
    in
        div
            [ class "shortcut-card shortcut-box"
            , onClick address Rotate
            , style
                [ ( "transform", transformString card.rotation )
                ]
            ]
            (List.map Path.view card.paths)
