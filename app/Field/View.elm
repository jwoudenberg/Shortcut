module Field.View (..) where

import Signal
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Field.Model exposing (..)
import Card.Update


viewElement : Signal.Address Card.Update.Action -> Field -> Html
viewElement address { x, y, size } =
    div
        [ class "shortcut-field shortcut-box"
        , onClick address Card.Update.Move
        , style
            [ ( "top", toString y ++ "px" )
            , ( "left", toString x ++ "px" )
            , ( "width", toString size ++ "px" )
            , ( "height", toString size ++ "px" )
            ]
        ]
        []
