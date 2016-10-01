module Shortcut exposing (main)

import Html.App as App
import Model exposing (..)
import View


boardSize : Int
boardSize =
    4


startGame : Model
startGame =
    { positionedCards = []
    , board = Model.initBoard boardSize
    , deckLocation = { col = (boardSize + 1), row = 0 }
    , nextId = 1
    , selectedCardId = 0
    , fieldSize = 100
    }


main : Program Never
main =
    App.program
        { init = startGame ! []
        , view = View.view
        , update = Model.update
        , subscriptions = \_ -> Sub.none
        }
