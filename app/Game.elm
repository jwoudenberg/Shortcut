module Game exposing (Model, Msg, update, view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.App exposing (map)
import Base exposing (ID)
import Board
import Field
import Deck
import Card


-- MODEL


type alias Model =
    { board : Board.Model
    , cards : List Card.Model
    , deck : Deck.Model
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
                Board.PlaceCard field ->
                    moveCard field model

        DeckMsg msg ->
            case msg of
                Deck.Draw ->
                    drawCard model


updateCard : ID -> Card.Msg -> Model -> Model
updateCard id msg model =
    let
        maybeUpdate : Card.Model -> Card.Model
        maybeUpdate card =
            if card.id == id then
                Card.update msg card
            else
                card
    in
        { model | cards = List.map maybeUpdate model.cards }


selectCard : ID -> Model -> Model
selectCard newSelectedCardId model =
    let
        updateCard : Card.Model -> Card.Model
        updateCard card =
            if card.id == newSelectedCardId then
                Card.update Card.Select card
            else
                Card.update Card.Deselect card
    in
        { model
            | selectedCardId = newSelectedCardId
            , cards = List.map updateCard model.cards
        }


moveCard : Field.Model -> Model -> Model
moveCard field model =
    let
        msg : Msg
        msg =
            CardMsg model.selectedCardId (Card.Move field)
    in
        update msg model


drawCard : Model -> Model
drawCard model =
    let
        newCard : Card.Model
        newCard =
            Card.init model.nextId model.deck

        addCard : Model -> Model
        addCard model =
            { model
                | nextId = model.nextId + 1
                , cards = model.cards ++ [ newCard ]
            }

        selectAddedCard : Model -> Model
        selectAddedCard model =
            update (CardMsg newCard.id Card.Select)
                model
    in
        model
            |> addCard
            |> selectAddedCard



---- VIEW ----


view : Model -> Html Msg
view model =
    let
        viewCard : Card.Model -> Html Msg
        viewCard card =
            Card.view card
                |> map (CardMsg card.id)

        board : Html Msg
        board =
            Board.view model.board
                |> map BoardMsg

        deck : Html Msg
        deck =
            Deck.view model.deck
                |> map DeckMsg
    in
        div
            [ class "shortcut-game"
            ]
            [ board
            , deck
            , div []
                (List.map viewCard model.cards)
            ]
