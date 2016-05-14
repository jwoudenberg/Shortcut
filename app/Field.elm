module Field exposing (Model, Msg(..), view, positionStyle)

import Html exposing (Html, div)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick)


-- MODEL


type alias Model =
    { x : Int
    , y : Int
    , size : Int
    }


type Msg
    = Click



-- VIEW


view : Model -> Html Msg
view model =
    div
        [ class "shortcut-field shortcut-box"
        , onClick Click
        , style (positionStyle model)
        ]
        []


positionStyle : Model -> List ( String, String )
positionStyle { x, y, size } =
    [ ( "top", toString y ++ "px" )
    , ( "left", toString x ++ "px" )
    , ( "width", toString size ++ "px" )
    , ( "height", toString size ++ "px" )
    ]
