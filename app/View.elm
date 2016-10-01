module View exposing (view)

import Model exposing (Model, ID, PositionedCard, Location, Msg(..))
import List.Extra
import Card.View as Card
import Card.Model
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
        , cardsView model.fieldSize model.selectedCardId model.positionedCards
        ]


cardsView : Int -> ID -> List PositionedCard -> Html Msg
cardsView fieldSize selectedCardId positionedCards =
    div []
        (List.map
            (\card -> positionedCardView fieldSize (card.id == selectedCardId) card)
            positionedCards
        )


positionedCardView : Int -> Bool -> PositionedCard -> Html Msg
positionedCardView fieldSize selected positionedCard =
    Card.view { selected = selected, rotation = positionedCard.rotation } positionedCard.card
        |> App.map (mapCardMsg selected positionedCard.id)
        |> List.Extra.singleton
        |> div
            [ style (Styles.positionStyle fieldSize positionedCard.location)
            ]


mapCardMsg : Bool -> ID -> Card.Model.Msg -> Msg
mapCardMsg selected id (Card.Model.Clicked) =
    if selected then
        RotateCard id
    else
        SelectCard id


boardView : Int -> List Location -> Html Msg
boardView fieldSize locations =
    div []
        (List.map (fieldView fieldSize) locations)


fieldView : Int -> Location -> Html Msg
fieldView fieldSize location =
    div
        [ style (Styles.fieldStyle fieldSize location)
        , onClick (MoveSelectedCard location)
        ]
        []


deckView : Int -> Location -> Html Msg
deckView fieldSize location =
    div
        [ style (Styles.fieldStyle fieldSize location)
        , onClick DrawCard
        ]
        []
