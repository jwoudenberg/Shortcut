module Deck exposing (Msg(..), view)

import Html exposing (Html)
import Html.App exposing (map)
import Field


-- MODEL


type Msg
    = Draw



---- VIEW ----


view : Html Msg
view =
    Field.view
        |> map (\_ -> Draw)
