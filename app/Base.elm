module Base exposing (ID, Context, Location, position)

import Html exposing (Html, div)
import Html.Attributes exposing (style, class)


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
        , class "shortcut-box shortcut-positioner"
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
        [ ( "top", toString y ++ "px" )
        , ( "left", toString x ++ "px" )
        , ( "width", toString size ++ "px" )
        , ( "height", toString size ++ "px" )
        ]
