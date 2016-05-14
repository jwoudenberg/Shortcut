module Card exposing (Model, Msg(..), update, view, init)

import Html exposing (Html, div)
import Base exposing (ID)
import Html.Attributes exposing (style, classList)
import Html.Events exposing (onClick)
import Field
import Path.Main as Path
import Path.Edge as Edge


-- MODEL


type alias Rotation =
    Int


type alias Model =
    { paths : List Path.Model
    , rotation : Int
    , id : ID
    , selected : Bool
    , field : Field.Model
    }



-- INIT


init : ID -> Field.Model -> Model
init id field =
    { paths =
        [ ( Edge.BottomLeft, Edge.TopRight )
        , ( Edge.BottomRight, Edge.RightBottom )
        , ( Edge.RightTop, Edge.LeftTop )
        , ( Edge.LeftBottom, Edge.TopLeft )
        ]
    , rotation = 0
    , id = id
    , selected = False
    , field = field
    }



-- MSG


type Msg
    = Rotate
    | Select
    | Deselect
    | Move Field.Model



-- UPDATE


update : Msg -> Model -> Model
update msg model =
    case msg of
        Rotate ->
            { model | rotation = model.rotation + 1 }

        Select ->
            { model | selected = True }

        Deselect ->
            { model | selected = False }

        Move newField ->
            { model | field = newField }



-- VIEW


view : Model -> Html Msg
view model =
    let
        transformString : Int -> String
        transformString angle =
            "rotate(" ++ toString (angle * 90) ++ "deg)"

        clickMsg : Msg
        clickMsg =
            if model.selected then
                Rotate
            else
                Select

        zIndex : String
        zIndex =
            if model.selected then
                "1"
            else
                "0"

        styleAttribute : List ( String, String )
        styleAttribute =
            [ ( "transform", transformString model.rotation )
            , ( "z-index", zIndex )
            ]
                ++ (Field.positionStyle model.field)
    in
        div
            [ classList
                [ ( "shortcut-card", True )
                , ( "shortcut-box", True )
                , ( "selected", model.selected )
                ]
            , onClick clickMsg
            , style styleAttribute
            ]
            (List.map Path.view model.paths)
