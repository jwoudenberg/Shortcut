module Game exposing (Model, Msg, update, view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.App exposing (map)
import Base exposing (Context, ID, Location, position)
import Board
import Deck
import Card


-- MODEL


type alias PositionedCard =
    { card : Card.Model
    , id : ID
    , location : Location
    }


type alias Model =
    { board : Board.Model
    , positionedCards : List PositionedCard
    , deckLocation : Location
    , selectedCardId : ID
    , nextId : ID
    }



-- MSG


type Msg
    = CardMsg ID Card.Msg
    | BoardMsg Board.Msg
    | DeckMsg Deck.Msg



-- UPDATE


update : Msg -> Model -> Model
update msg model =
    case msg of
        CardMsg id msg ->
            case msg of
                Card.Select ->
                    selectCard id model

                _ ->
                    updateCard id msg model

        BoardMsg msg ->
            case msg of
                Board.PlaceCard location ->
                    updatePositionedCard model.selectedCardId (moveCard location) model

        DeckMsg msg ->
            case msg of
                Deck.Draw ->
                    drawCard model


updatePositionedCard : ID -> (PositionedCard -> PositionedCard) -> Model -> Model
updatePositionedCard id update model =
    let
        maybeUpdate : PositionedCard -> PositionedCard
        maybeUpdate positionedCard =
            if positionedCard.id == id then
                update positionedCard
            else
                positionedCard
    in
        { model | positionedCards = List.map maybeUpdate model.positionedCards }


updateCard : ID -> Card.Msg -> Model -> Model
updateCard id msg model =
    let
        update : PositionedCard -> PositionedCard
        update positionedCard =
            { positionedCard | card = Card.update msg positionedCard.card }
    in
        updatePositionedCard id update model


moveCard : Location -> PositionedCard -> PositionedCard
moveCard newLocation card =
    { card | location = newLocation }


selectCard : ID -> Model -> Model
selectCard newSelectedCardId model =
    let
        updatePositionedCard : PositionedCard -> PositionedCard
        updatePositionedCard positionedCard =
            let
                msg : Card.Msg
                msg =
                    if positionedCard.id == newSelectedCardId then
                        Card.Select
                    else
                        Card.Deselect
            in
                { positionedCard | card = (Card.update msg) positionedCard.card }
    in
        { model
            | selectedCardId = newSelectedCardId
            , positionedCards = List.map updatePositionedCard model.positionedCards
        }


drawCard : Model -> Model
drawCard model =
    let
        newCard : PositionedCard
        newCard =
            { id = model.nextId
            , location = model.deckLocation
            , card = Card.init
            }

        addCard : Model -> Model
        addCard model =
            { model
                | nextId = model.nextId + 1
                , positionedCards = model.positionedCards ++ [ newCard ]
            }

        selectAddedCard : Model -> Model
        selectAddedCard model =
            update (CardMsg newCard.id Card.Select)
                model
    in
        model
            |> addCard
            |> selectAddedCard



-- VIEW


view : Context -> Model -> Html Msg
view context model =
    let
        viewCard : PositionedCard -> Html Msg
        viewCard positionedCard =
            Card.view positionedCard.card
                |> position context.fieldSize positionedCard.location
                |> map (CardMsg positionedCard.id)

        board : Html Msg
        board =
            Board.view context model.board
                |> map BoardMsg

        deck : Html Msg
        deck =
            Deck.view
                |> position context.fieldSize model.deckLocation
                |> map DeckMsg
    in
        div
            [ class "shortcut-game"
            ]
            [ board
            , deck
            , div []
                (List.map viewCard model.positionedCards)
            ]
