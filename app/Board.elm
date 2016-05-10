module Board exposing (Model, Msg, init, view)

import Dict exposing (Dict)
import Html exposing (Html, div)
import Html.App exposing (map)
import Html.Attributes exposing (class)
import Field


-- MODEL


type alias Place =
    ( Int, Int )


type alias Model =
    Dict Place Field.Model


type Msg
    = PlaceCard Field.Model



-- INIT


init : Int -> Int -> Model
init boardSize fieldSize =
    let
        places : Int -> List Place
        places boardSize =
            selfprod [0..(boardSize - 1)]

        field : Place -> Field.Model
        field ( row, col ) =
            { x = row * (fieldSize - 1)
            , y = col * (fieldSize - 1)
            , size = fieldSize
            }

        cell : Place -> Model
        cell place =
            Dict.singleton place
                (field place)
    in
        List.map cell (places boardSize)
            |> List.foldr Dict.union Dict.empty


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



---- VIEW ----


view : Model -> Html Msg
view model =
    let
        fields =
            Dict.values model

        drawField : Field.Model -> Html Msg
        drawField field =
            map (\_ -> PlaceCard field) (Field.view field)
    in
        div
            [ class "shortcut-board"
            ]
            (List.map drawField fields)
