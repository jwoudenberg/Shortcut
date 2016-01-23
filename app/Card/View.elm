module Card.View (cardElement) where

import Signal
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Card.Model exposing (..)
import Card.Update
import Path.View


cardElement : Signal.Address Card.Update.Action -> Card -> Html
cardElement address card =
    let
        transformString angle =
            "rotate(" ++ toString (angle * 90) ++ "deg)"
    in
        div
            [ class "shortcut-card shortcut-box"
            , onClick address Card.Update.Rotate
            , style
                [ ( "transform", transformString card.rotation )
                ]
            ]
            (List.map Path.View.pathElement card.paths)
