module Main (..) where

import Text
import Graphics.Element as Element


main =
    Text.fromString "Hello World"
        |> Element.centered
