module Card exposing (Card, Action(..), card, id, view, update)

import Signal
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Base exposing (..)
import Field exposing (Field(..))
import Path.Main as Path exposing (Path(..), Edge(..))


---- MODEL ----


type alias Rotation =
    Int


type Card
    = Card
        { paths : List Path
        , rotation : Rotation
        , id : ID
        , selected : Bool
        , field : Field
        }


card : ID -> Field -> Card
card id field =
    Card
        { paths =
            [ Path ( BottomLeft, TopRight )
            , Path ( BottomRight, RightBottom )
            , Path ( RightTop, LeftTop )
            , Path ( LeftBottom, TopLeft )
            ]
        , rotation = 0
        , id = id
        , selected = False
        , field = field
        }


id : Card -> ID
id (Card { id }) =
    id


selected : Card -> Bool
selected (Card { selected }) =
    selected


field : Card -> Field
field (Card { field }) =
    field


rotation : Card -> Int
rotation (Card { rotation }) =
    rotation


paths : Card -> List Path
paths (Card { paths }) =
    paths



---- UPDATE ----


type Action
    = Rotate
    | Select
    | Deselect
    | Move Field


update : Action -> Card -> Card
update action (Card cardConfig) =
    case action of
        Rotate ->
            Card { cardConfig | rotation = cardConfig.rotation + 1 }

        Select ->
            Card { cardConfig | selected = True }

        Deselect ->
            Card { cardConfig | selected = False }

        Move field ->
            Card { cardConfig | field = field }



---- VIEW ----


view : Signal.Address Action -> Card -> Html
view address card =
    let
        transformString : Int -> String
        transformString angle =
            "rotate(" ++ toString (angle * 90) ++ "deg)"

        clickAction : Action
        clickAction =
            if (selected card) then
                Rotate
            else
                Select

        zIndex : String
        zIndex =
            if (selected card) then
                "1"
            else
                "0"

        styleAttribute : List ( String, String )
        styleAttribute =
            [ ( "transform", transformString (rotation card) )
            , ( "z-index", zIndex )
            ]
                ++ (Field.positionStyle (field card))
    in
        div
            [ classList
                [ ( "shortcut-card", True )
                , ( "shortcut-box", True )
                , ( "selected", (selected card) )
                ]
            , key (toString (id card))
            , onClick address clickAction
            , style styleAttribute
            ]
            (List.map Path.view (paths card))
