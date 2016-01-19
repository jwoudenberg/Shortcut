module Card.Model (..) where

import Path.Model exposing (Path)


type alias Card =
    { paths : List Path
    }
