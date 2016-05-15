module StyleCss exposing (css, Classes(..), shortcutNamespace)

import Css exposing (..)
import Html.CssHelpers exposing (withNamespace)
import Css.Namespace exposing (namespace)


type Classes
    = Game
    | Box
    | Positioner
    | PathContainer
    | PathFill
    | PathBorder
    | Card
    | Selected
    | Field


shortcutNamespace =
    withNamespace "shortcut"


css : Stylesheet
css =
    (stylesheet << namespace "shortcut")
        [ (.) Game
            [ position relative
            ]
        , (.) Positioner
            [ property "transition" "top ease-in-out 300ms, left ease-in-out 300ms"
            ]
        , (.) Box
            [ position absolute
            , width inherit
            , height inherit
            , boxSizing borderBox
            , margin4 (px -1) zero zero (px -1)
            ]
        , (.) PathContainer
            [ opacity (float 0.6)
            , property "stroke" "#444444"
            , property "stroke-width" "14"
            , property "fill" "#444444"
            , property "transition" "opacity 1s, fill 1s, stroke 1s"
            ]
        , (.) PathFill
            [ opacity (float 0.2)
            , property "stroke" "none"
            , property "transition" "opacity 1s"
            ]
        , (.) PathBorder
            [ property "fill" "none"
            ]
        , (.) Card
            [ border3 (px 1) solid (hex "aaa")
            , backgroundColor (hex "eee")
            , property "z-index" "1"
            , property "transition" "transform ease-in-out 300ms, box-shadow 100ms"
            , overflow hidden
            , width (px 100)
            , height (px 100)
            , withClass Selected
                [ property "box-shadow" "0 0 5px rgba(0, 0, 0, 0.5)"
                ]
            ]
        , (.) Field
            [ border3 (px 1) solid (hex "ddd")
            ]
        ]
