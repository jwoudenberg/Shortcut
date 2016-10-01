module View exposing (view)

import Model exposing (Model, PositionedCard, Location, Msg(..))
import Card.View as Card
import Html exposing (..)
import Html.App as App
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Styles


view : Model -> Html Msg
view model =
    div
        [ style Styles.gameStyle
        ]
        [ boardView model.fieldSize model.board
        , deckView model.fieldSize model.deckLocation
        , div []
            (List.map (positionedCardView model.fieldSize) model.positionedCards)
        ]


positionedCardView : Int -> PositionedCard -> Html Msg
positionedCardView fieldSize positionedCard =
    [ Card.view positionedCard.card ]
        |> div [ style (Styles.positionStyle fieldSize positionedCard.location) ]
        |> App.map (CardMsg positionedCard.id)


boardView : Int -> List Location -> Html Msg
boardView fieldSize locations =
    div []
        (List.map (fieldView fieldSize) locations)


fieldView : Int -> Location -> Html Msg
fieldView fieldSize location =
    div
        [ style (Styles.fieldStyle fieldSize location)
        , onClick (PlaceCard location)
        ]
        []


deckView : Int -> Location -> Html Msg
deckView fieldSize location =
    div
        [ style (Styles.fieldStyle fieldSize location)
        , onClick DrawCard
        ]
        []
