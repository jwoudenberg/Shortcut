module Card (Card, Action(..), card, view, update) where

import Signal
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Shared exposing (ID)
import Field
import Path.Main as Path exposing (Path, Edge(..))


---- MODEL ----


type alias Rotation =
    Int


type alias Card =
    { paths : List Path
    , rotation : Rotation
    , id : ID
    , selected : Bool
    , field : Field.Field
    }


card : ID -> Field.Field -> Card
card id field =
    { paths =
        [ ( BottomLeft, TopRight )
        , ( BottomRight, RightBottom )
        , ( RightTop, LeftTop )
        , ( LeftBottom, TopLeft )
        ]
    , rotation = 0
    , id = id
    , selected = False
    , field = field
    }



---- UPDATE ----


type Action
    = Rotate
    | Select
    | Deselect
    | Move Field.Field


update : Action -> Card -> Card
update action card =
    case action of
        Rotate ->
            { card | rotation = card.rotation + 1 }

        Select ->
            { card | selected = True }

        Deselect ->
            { card | selected = False }

        Move field ->
            { card | field = field }



---- VIEW ----


view : Signal.Address Action -> Card -> Html
view address card =
    let
        transformString : Int -> String
        transformString angle =
            "rotate(" ++ toString (angle * 90) ++ "deg)"

        clickAction : Action
        clickAction =
            if card.selected then
                Rotate
            else
                Select

        field : Field.Field
        field =
            card.field

        zIndex : String
        zIndex =
            if card.selected then
                "1"
            else
                "0"
    in
        div
            [ classList
                [ ( "shortcut-card", True )
                , ( "shortcut-box", True )
                , ( "selected", card.selected )
                ]
            , key (toString card.id)
            , onClick address clickAction
            , style
                [ ( "transform", transformString card.rotation )
                , ( "z-index", zIndex )
                , ( "top", toString field.y ++ "px" )
                , ( "left", toString field.x ++ "px" )
                , ( "width", toString field.size ++ "px" )
                , ( "height", toString field.size ++ "px" )
                ]
            ]
            (List.map Path.view card.paths)
