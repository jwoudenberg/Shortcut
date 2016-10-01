module Card.Model exposing (Model, Path, Edge(..), Msg(..), init)


type alias Rotation =
    Int


type alias Model =
    List Path


type alias Path =
    ( Edge, Edge )


type Edge
    = BottomLeft
    | BottomRight
    | RightBottom
    | RightTop
    | TopRight
    | TopLeft
    | LeftTop
    | LeftBottom
    | Unconnected


type Msg
    = Clicked


init : Model
init =
    [ ( BottomLeft, TopRight )
    , ( BottomRight, RightBottom )
    , ( RightTop, LeftTop )
    , ( LeftBottom, TopLeft )
    ]
