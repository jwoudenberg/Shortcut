module Card.Model exposing (Model, Path, Edge(..), Msg(..), update, init)


type alias Rotation =
    Int


type alias Model =
    { paths : List Path
    , rotation : Int
    , selected : Bool
    }


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
    = Rotate
    | Select
    | Deselect


init : Model
init =
    { paths =
        [ ( BottomLeft, TopRight )
        , ( BottomRight, RightBottom )
        , ( RightTop, LeftTop )
        , ( LeftBottom, TopLeft )
        ]
    , rotation = 0
    , selected = False
    }


update : Msg -> Model -> Model
update msg model =
    case msg of
        Rotate ->
            { model | rotation = model.rotation + 1 }

        Select ->
            { model | selected = True }

        Deselect ->
            { model | selected = False }
