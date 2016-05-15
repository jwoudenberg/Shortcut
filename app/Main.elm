module Shortcut exposing (..)

import Html.App as Html
import Base exposing (Context)
import Board
import Game


context : Context
context =
    { fieldSize = 100 }


boardSize : Int
boardSize =
    4


startGame : Game.Model
startGame =
    { positionedCards = []
    , board = Board.init boardSize
    , deckLocation = { col = (boardSize + 1), row = 0 }
    , nextId = 1
    , selectedCardId = 0
    }


init : ( Game.Model, Cmd a )
init =
    ( startGame, Cmd.none )


update : Game.Msg -> Game.Model -> ( Game.Model, Cmd a )
update msg model =
    Game.update msg model
        |> \model -> ( model, Cmd.none )


main : Program Never
main =
    Html.program
        { init = init
        , view = (Game.view context)
        , update = update
        , subscriptions = \_ -> Sub.none
        }
