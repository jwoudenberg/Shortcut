module Field exposing (Msg(..), view)

import Html exposing (Html, div)
import Html.Events exposing (onClick)
import StyleCss exposing (shortcutNamespace, Classes(..))


type Msg
    = Click



-- VIEW


view : Html Msg
view =
    div
        [ shortcutNamespace.class [ Field, Box ]
        , onClick Click
        ]
        []
