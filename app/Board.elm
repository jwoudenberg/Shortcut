module Board (Board, empty, view) where

import Dict exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Card
import Field


---- MODEL ----


type alias Place =
    ( Int, Int )


type alias Board =
    Dict Place Field.Field


empty : Int -> Int -> Board
empty boardSize fieldSize =
    let
        places : Int -> List Place
        places boardSize =
            selfprod [0..(boardSize - 1)]

        field : Place -> Field.Field
        field ( row, col ) =
            { x = row * (fieldSize - 1)
            , y = col * (fieldSize - 1)
            , size = fieldSize
            }

        cell : Place -> Board
        cell place =
            Dict.singleton
                place
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


view : Signal.Address Card.Action -> Board -> Html
view address board =
    div
        [ class "shortcut-board"
        ]
        (List.map (Field.view address) (Dict.values board))
