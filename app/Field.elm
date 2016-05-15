module Field exposing (Msg(..), view)

import Html exposing (Html, div)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick)


type Msg
    = Click



-- VIEW


view : Html Msg
view =
    div
        [ class "shortcut-field shortcut-box"
        , onClick Click
        ]
        []
