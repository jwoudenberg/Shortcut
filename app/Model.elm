module Model exposing (Model, PositionedCard, Location, Msg(..), update, initBoard)

import Card.Model as Card


type alias Model =
    { board : List Location
    , positionedCards : List PositionedCard
    , deckLocation : Location
    , selectedCardId : ID
    , nextId : ID
    , fieldSize : Int
    }


type alias PositionedCard =
    { card : Card.Model
    , id : ID
    , location : Location
    }


type alias ID =
    Int


type alias Location =
    { row : Int
    , col : Int
    }


type Msg
    = CardMsg ID Card.Msg
    | PlaceCard Location
    | DrawCard


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    (update' msg model) ! []


update' : Msg -> Model -> Model
update' msg model =
    case msg of
        CardMsg id (Card.Select) ->
            selectCard id model

        CardMsg id msg ->
            updateCard id msg model

        PlaceCard location ->
            updatePositionedCard model.selectedCardId (moveCard location) model

        DrawCard ->
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
            update' (CardMsg newCard.id Card.Select)
                model
    in
        model
            |> addCard
            |> selectAddedCard


initBoard : Int -> List Location
initBoard boardSize =
    selfprod [0..(boardSize - 1)]
        |> List.map (\( row, col ) -> { row = row, col = col })


selfprod : List a -> List ( a, a )
selfprod xs =
    xprod xs xs


xprod : List a -> List b -> List ( a, b )
xprod xs ys =
    case xs of
        [] ->
            []

        x :: xs' ->
            (List.map ((,) x) ys) ++ (xprod xs' ys)
