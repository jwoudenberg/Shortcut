module Shortcut exposing (..)

import Html.App as Html
import Board
import Game


fieldSize : Int
fieldSize =
    100


boardSize : Int
boardSize =
    4


startGame : Game.Model
startGame =
    { cards = []
    , board = Board.init boardSize fieldSize
    , deck = { x = (boardSize + 1) * fieldSize, y = 0, size = fieldSize }
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
        , view = Game.view
        , update = update
        , subscriptions = \_ -> Sub.none
        }
