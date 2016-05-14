module Path.Edge exposing (Model(..))


type Model
    = BottomLeft
    | BottomRight
    | RightBottom
    | RightTop
    | TopRight
    | TopLeft
    | LeftTop
    | LeftBottom
    | Unconnected
