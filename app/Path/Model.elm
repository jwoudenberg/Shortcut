module Path.Model (..) where


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


type alias Path =
    ( Edge, Edge )
