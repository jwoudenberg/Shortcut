module Board.Model (Board, empty) where

import Dict exposing (..)
import Field.Model exposing (Field)


type alias Place =
    ( Int, Int )


type alias Board =
    Dict Place Field


empty : Int -> Int -> Board
empty boardSize fieldSize =
    let
        places : Int -> List Place
        places boardSize =
            selfprod [0..(boardSize - 1)]

        field : Place -> Field
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
