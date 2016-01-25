module Game.Model (Game) where

import Board.Model exposing (Board)
import Card.Model exposing (Card)


type alias Game =
    { board : Board
    , cards : List Card
    }
