module Game (Game(..), update, view) where

import Html exposing (..)
import Html.Attributes exposing (..)
import Base exposing (ID(..))
import Board exposing (Board(..))
import Field exposing (Field(..))
import Deck exposing (Deck(..))
import Card exposing (Card(..))


---- MODEL ----


type Game
    = Game
        { board : Board
        , cards : List Card
        , deck : Deck
        , selectedCardId : ID
        , nextId : ID
        }


board : Game -> Board
board (Game { board }) =
    board


cards : Game -> List Card
cards (Game { cards }) =
    cards


deck : Game -> Deck
deck (Game { deck }) =
    deck


selectedCardId : Game -> ID
selectedCardId (Game { selectedCardId }) =
    selectedCardId


nextId : Game -> ID
nextId (Game { nextId }) =
    nextId



---- UPDATE ----


type Action
    = CardAction ID Card.Action
    | BoardAction Board.Action
    | DeckAction Deck.Action


update : Action -> Game -> Game
update gameAction game =
    case gameAction of
        CardAction id cardAction ->
            case cardAction of
                Card.Select ->
                    selectCard id game

                _ ->
                    updateCard id cardAction game

        BoardAction boardAction ->
            case boardAction of
                Board.PlaceCard field ->
                    moveCard field game

        DeckAction deckAction ->
            case deckAction of
                Deck.Draw ->
                    drawCard game


updateCard : ID -> Card.Action -> Game -> Game
updateCard id cardAction (Game gameConfig) =
    let
        maybeUpdate : Card -> Card
        maybeUpdate card =
            if (Card.id card) == id then
                Card.update cardAction card
            else
                card
    in
        Game
            { gameConfig | cards = List.map maybeUpdate gameConfig.cards }


selectCard : ID -> Game -> Game
selectCard newSelectedCardId (Game gameConfig) =
    let
        updateCard : Card -> Card
        updateCard card =
            if (Card.id card) == newSelectedCardId then
                Card.update Card.Select card
            else
                Card.update Card.Deselect card
    in
        Game
            { gameConfig
                | selectedCardId = newSelectedCardId
                , cards = List.map updateCard gameConfig.cards
            }


moveCard : Field -> Game -> Game
moveCard field game =
    let
        cardAction : Action
        cardAction =
            CardAction (selectedCardId game) (Card.Move field)
    in
        update cardAction game


drawCard : Game -> Game
drawCard game =
    let
        deckField : Field
        deckField =
            Deck.field (deck game)

        newCardId : ID
        newCardId =
            nextId game

        newCard : Card
        newCard =
            Card.card newCardId deckField

        incrementId : ID -> ID
        incrementId (ID n) =
            ID (n + 1)

        addCard : Game -> Game
        addCard (Game gameConfig) =
            Game
                { gameConfig
                    | nextId = incrementId gameConfig.nextId
                    , cards = newCard :: gameConfig.cards
                }

        selectAddedCard : Game -> Game
        selectAddedCard game =
            update
                (CardAction newCardId Card.Select)
                game
    in
        game
            |> addCard
            |> selectAddedCard



---- VIEW ----


view : Signal.Address Action -> Game -> Html
view address game =
    let
        cardAddress : Card -> Signal.Address Card.Action
        cardAddress card =
            Signal.forwardTo address (CardAction (Card.id card))

        boardAddress : Signal.Address Board.Action
        boardAddress =
            Signal.forwardTo address BoardAction

        deckAddress : Signal.Address Deck.Action
        deckAddress =
            Signal.forwardTo address DeckAction

        viewCard : Card -> Html
        viewCard card =
            Card.view (cardAddress card) card
    in
        div
            [ class "shortcut-game"
            ]
            [ Board.view boardAddress (board game)
            , Deck.view deckAddress (deck game)
            , div
                []
                (List.map viewCard (cards game))
            ]
