module Card exposing (Model, Msg(..), update, view, init)

import Html exposing (Html, div)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Path.Main as Path
import Path.Edge as Edge
import Styles


-- MODEL


type alias Rotation =
    Int


type alias Model =
    { paths : List Path.Model
    , rotation : Int
    , selected : Bool
    }



-- INIT


init : Model
init =
    { paths =
        [ ( Edge.BottomLeft, Edge.TopRight )
        , ( Edge.BottomRight, Edge.RightBottom )
        , ( Edge.RightTop, Edge.LeftTop )
        , ( Edge.LeftBottom, Edge.TopLeft )
        ]
    , rotation = 0
    , selected = False
    }



-- MSG


type Msg
    = Rotate
    | Select
    | Deselect



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



-- VIEW


view : Model -> Html Msg
view model =
    let
        clickMsg : Msg
        clickMsg =
            if model.selected then
                Rotate
            else
                Select
    in
        div
            [ onClick clickMsg
            , style (Styles.cardStyle model.rotation model.selected)
            ]
            (List.map Path.view model.paths)
