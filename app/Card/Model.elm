module Card.Model (..) where

import Path.Model exposing (Path, Edge(..))


type alias Rotation =
    Int


type alias Card =
    { paths : List Path
    , rotation : Rotation
    , id : Int
    }


card : Card
card =
    { paths =
        [ ( BottomLeft, TopRight )
        , ( BottomRight, RightBottom )
        , ( RightTop, LeftTop )
        , ( LeftBottom, TopLeft )
        ]
    , rotation = 0
    , id = 0
    }
