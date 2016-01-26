module Field (Field, view) where

import Signal
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Card


---- MODEL ----


type alias Field =
    { x : Int
    , y : Int
    , size : Int
    }



---- VIEW ----


view : Signal.Address Card.Action -> Field -> Html
view address { x, y, size } =
    div
        [ class "shortcut-field shortcut-box"
        , onClick address Card.Move
        , style
            [ ( "top", toString y ++ "px" )
            , ( "left", toString x ++ "px" )
            , ( "width", toString size ++ "px" )
            , ( "height", toString size ++ "px" )
            ]
        ]
        []
