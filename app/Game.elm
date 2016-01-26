module Game (Game, update, view) where

import Html exposing (..)
import Html.Attributes exposing (..)
import Shared exposing (ID)
import Board
import Deck exposing (Deck)
import Card exposing (Card)


---- MODEL ----


type alias Game =
    { board : Board.Board
    , cards : List Card
    , deck : Deck
    , selectedCardId : ID
    , nextId : ID
    }



---- UPDATE ----


type Action
    = CardAction ID Card.Action
    | BoardAction Board.Action
    | DeckAction Deck.Action


updateCard : ID -> Card.Action -> Card.Card -> Card.Card
updateCard id cardAction card =
    if card.id == id then
        Card.update cardAction card
    else
        card


updateSelectedCard : ID -> Game -> Game
updateSelectedCard selectedCardId game =
    let
        updateCard : Card.Card -> Card.Card
        updateCard card =
            if card.id == selectedCardId then
                Card.update Card.Select card
            else
                Card.update Card.Deselect card
    in
        { game
            | selectedCardId = selectedCardId
            , cards = List.map updateCard game.cards
        }


update : Action -> Game -> Game
update gameAction game =
    case gameAction of
        CardAction id cardAction ->
            case cardAction of
                Card.Select ->
                    updateSelectedCard id game

                _ ->
                    { game | cards = List.map (updateCard id cardAction) game.cards }

        BoardAction boardAction ->
            case boardAction of
                Board.PlaceCard field ->
                    update (CardAction game.selectedCardId (Card.Move field)) game

        DeckAction deckAction ->
            let
                newCard : Card.Card
                newCard =
                    Card.card game.nextId game.deck

                addCard : Game -> Game
                addCard game =
                    { game
                        | nextId = game.nextId + 1
                        , cards = newCard :: game.cards
                    }

                selectAddedCard : Game -> Game
                selectAddedCard game =
                    update (CardAction newCard.id Card.Select) game
            in
                game
                    |> addCard
                    |> selectAddedCard



---- VIEW ----


view : Signal.Address Action -> Game -> Html
view address game =
    let
        viewCard : Card.Card -> Html
        viewCard card =
            Card.view (Signal.forwardTo address (CardAction card.id)) card
    in
        div
            [ class "shortcut-game"
            ]
            [ Board.view (Signal.forwardTo address BoardAction) game.board
            , Deck.view (Signal.forwardTo address DeckAction) game.deck
            , div
                []
                (List.map viewCard game.cards)
            ]
