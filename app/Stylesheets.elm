port module Stylesheets exposing (..)

import Html exposing (div)
import Html.App as Html
import Css.File exposing (..)
import StyleCss


port files : CssFileStructure -> Cmd msg


cssFiles : CssFileStructure
cssFiles =
    toFileStructure [ ( "style.css", compile StyleCss.css ) ]


main : Program Never
main =
    Html.program
        { init = ( (), files cssFiles )
        , view = \_ -> (div [] [])
        , update = \_ _ -> ( (), Cmd.none )
        , subscriptions = \_ -> Sub.none
        }
