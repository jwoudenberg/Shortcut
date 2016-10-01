module Shortcut exposing (main)

import Html.App as App
import Model exposing (..)
import View


boardSize : Int
boardSize =
    4


fieldSize : Int
fieldSize =
    100


initModel : Model
initModel =
    { positionedCards = []
    , board = Model.initBoard boardSize
    , deckLocation = { col = (boardSize + 1), row = 0 }
    , nextId = 1
    , selectedCardId = 0
    , fieldSize = fieldSize
    }


main : Program Never
main =
    App.program
        { init = initModel ! []
        , view = View.view
        , update = Model.update
        , subscriptions = always Sub.none
        }
