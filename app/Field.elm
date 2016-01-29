module Field (Field(..), view, positionStyle) where

import Signal
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)


---- MODEL ----


type Field
    = Field
        { x : Int
        , y : Int
        , size : Int
        }



---- VIEW ----


view : Signal.Address () -> Field -> Html
view address field =
    div
        [ class "shortcut-field shortcut-box"
        , onClick address ()
        , style (positionStyle field)
        ]
        []


positionStyle : Field -> List ( String, String )
positionStyle (Field { x, y, size }) =
    [ ( "top", toString y ++ "px" )
    , ( "left", toString x ++ "px" )
    , ( "width", toString size ++ "px" )
    , ( "height", toString size ++ "px" )
    ]
