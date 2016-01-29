module Board (Board(..), Action(..), empty, view) where

import Dict exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Field exposing (Field(..))


---- UPDATE ----


type Action
    = PlaceCard Field



---- MODEL ----


type alias Place =
    ( Int, Int )


type Board
    = Board (Dict Place Field)


fields : Board -> Dict Place Field
fields (Board fields) =
    fields


empty : Int -> Int -> Board
empty boardSize fieldSize =
    let
        places : Int -> List Place
        places boardSize =
            selfprod [0..(boardSize - 1)]

        field : Place -> Field
        field ( row, col ) =
            Field
                { x = row * (fieldSize - 1)
                , y = col * (fieldSize - 1)
                , size = fieldSize
                }

        cell : Place -> Dict Place Field
        cell place =
            Dict.singleton
                place
                (field place)
    in
        List.map cell (places boardSize)
            |> List.foldr Dict.union Dict.empty
            |> Board


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


view : Signal.Address Action -> Board -> Html
view address board =
    let
        fieldAddress : Field -> Signal.Address ()
        fieldAddress field =
            Signal.forwardTo address (\_ -> PlaceCard field)

        viewField : Field -> Html
        viewField field =
            Field.view (fieldAddress field) field
    in
        div
            [ class "shortcut-board"
            ]
            (List.map viewField (Dict.values (fields board)))
