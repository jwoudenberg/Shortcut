module Board exposing (Model, Msg(..), init, view)

import Base exposing (Context, Location, position)
import Html exposing (Html, div)
import Html.App exposing (map)
import Field


-- MODEL


type alias Model =
    List Location


type Msg
    = PlaceCard Location



-- INIT


init : Int -> Model
init boardSize =
    selfprod [0..(boardSize - 1)]
        |> List.map (\( row, col ) -> { row = row, col = col })


selfprod : List a -> List ( a, a )
selfprod xs =
    xprod xs xs


xprod : List a -> List a -> List ( a, a )
xprod xs ys =
    case xs of
        [] ->
            []

        x :: xs' ->
            (List.map ((,) x) ys) ++ (xprod xs' ys)



-- VIEW


view : Context -> Model -> Html Msg
view { fieldSize } model =
    let
        field : Location -> Html Msg
        field location =
            Field.view
                |> position fieldSize location
                |> map (\_ -> PlaceCard location)
    in
        div []
            (List.map field model)
