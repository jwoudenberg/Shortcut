module Deck exposing (Model, Msg(..), view)

import Html exposing (Html)
import Html.App exposing (map)
import Field


-- MODEL


type alias Model =
    Field.Model


type Msg
    = Draw



---- VIEW ----


view : Model -> Html Msg
view model =
    Field.view model
        |> map (\_ -> Draw)
