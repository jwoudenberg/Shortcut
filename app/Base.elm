module Base exposing (ID, Context, Location, position)

import Html exposing (Html, div)
import Html.Attributes exposing (style)
import StyleCss exposing (shortcutNamespace, Classes(..))
import Css exposing (asPairs, top, left, width, height, px)


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
        [ style (positionStyle size location)
        , shortcutNamespace.class [ Positioner, Box ]
        ]
        [ node
        ]


positionStyle : Int -> Location -> List ( String, String )
positionStyle size { row, col } =
    let
        x =
            col * (size - 1)

        y =
            row * (size - 1)
    in
        asPairs
            [ top (px y)
            , left (px x)
            , width (px size)
            , height (px size)
            ]
