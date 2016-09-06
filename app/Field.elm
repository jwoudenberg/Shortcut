module Field exposing (Msg(..), view)

import Html exposing (Html, div)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Styles


type Msg
    = Click



-- VIEW


view : Html Msg
view =
    div
        [ style Styles.fieldStyle
        , onClick Click
        ]
        []
