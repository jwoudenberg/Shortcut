module Model exposing (Model, ID, PositionedCard, Location, Msg(..), update, initBoard)

import Card.Model as Card
import List.Extra


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
    , rotation : Int
    }


type alias ID =
    Int


type alias Location =
    { row : Int
    , col : Int
    }


type Msg
    = SelectCard ID
    | RotateCard ID
    | MoveSelectedCard Location
    | DrawCard


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    (update' msg model) ! []


update' : Msg -> Model -> Model
update' msg model =
    case msg of
        SelectCard id ->
            selectCard id model

        RotateCard id ->
            updatePositionedCard id rotateCard model

        MoveSelectedCard location ->
            updatePositionedCard model.selectedCardId (moveCard location) model

        DrawCard ->
            drawCard model


updatePositionedCard : ID -> (PositionedCard -> PositionedCard) -> Model -> Model
updatePositionedCard id fn model =
    { model
        | positionedCards =
            List.Extra.updateIf
                (.id >> (==) id)
                fn
                model.positionedCards
    }


moveCard : Location -> PositionedCard -> PositionedCard
moveCard newLocation positionedCard =
    { positionedCard
        | location = newLocation
    }


rotateCard : PositionedCard -> PositionedCard
rotateCard positionedCard =
    { positionedCard
        | rotation = positionedCard.rotation + 1
    }


selectCard : ID -> Model -> Model
selectCard newSelectedCardId model =
    { model
        | selectedCardId = newSelectedCardId
    }


initPositionedCard : ID -> Location -> PositionedCard
initPositionedCard id location =
    { id = id
    , location = location
    , card = Card.init
    , rotation = 0
    }


drawCard : Model -> Model
drawCard model =
    { model
        | positionedCards = model.positionedCards ++ [ initPositionedCard model.nextId model.deckLocation ]
        , selectedCardId = model.nextId
        , nextId = model.nextId + 1
    }


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
