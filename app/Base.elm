module Base exposing (ID, Context, Location, position)

import Html exposing (Html, div)
import Html.Attributes exposing (style)
import Styles


type alias ID =
    Int


type alias Context =
    { fieldSize : Int
    }


type alias Location =
    { row : Int
    , col : Int
    }


position : Int -> Location -> Html msg -> Html msg
position size location node =
    div
        [ style (Styles.positionStyle size location.row location.col)
        ]
        [ node
        ]
