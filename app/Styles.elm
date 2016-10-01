module Styles
    exposing
        ( gameStyle
        , cardStyle
        , fieldStyle
        , pathStyle
        , pathContainerStyle
        , pathFillStyle
        , pathBorderStyle
        , positionStyle
        )

import Css exposing (..)


gameStyle : List ( String, String )
gameStyle =
    Css.asPairs
        [ position relative
        , margin (px 10)
        ]


pathContainerStyle : List ( String, String )
pathContainerStyle =
    Css.asPairs
        [ opacity (float 0.6)
        , property "stroke" "#444444"
        , property "stroke-width" "14"
        , property "fill" "#444444"
        , property "transition" "opacity 1s, fill 1s, stroke 1s"
        ]


pathFillStyle : List ( String, String )
pathFillStyle =
    Css.asPairs
        [ opacity (float 0.2)
        , property "stroke" "none"
        , property "transition" "opacity 1s"
        ]


pathBorderStyle : List ( String, String )
pathBorderStyle =
    Css.asPairs
        [ property "fill" "none"
        ]


cardStyle : Int -> Bool -> List ( String, String )
cardStyle rotation selected =
    List.concat
        [ Css.asPairs
            [ border3 (px 1) solid (hex "aaa")
            , backgroundColor (hex "eee")
            , property "transition" "transform ease-in-out 300ms, box-shadow 100ms"
            , overflow hidden
            , width (px 100)
            , height (px 100)
            , transform (rotate (deg (rotation * 90)))
            ]
        , boxStyle
        , Css.asPairs <|
            if selected then
                [ property "box-shadow" "0 0 5px rgba(0, 0, 0, 0.5)"
                , property "z-index" "1"
                ]
            else
                [ property "z-index" "0"
                ]
        ]


fieldStyle : Int -> { row : Int, col : Int } -> List ( String, String )
fieldStyle size location =
    Css.asPairs
        [ border3 (px 1) solid (hex "ddd")
        ]
        ++ boxStyle
        ++ positionStyle size location


pathStyle : List ( String, String )
pathStyle =
    boxStyle


boxStyle : List ( String, String )
boxStyle =
    Css.asPairs
        [ position absolute
        , width inherit
        , height inherit
        , boxSizing borderBox
        , margin4 (px -1) zero zero (px -1)
        ]


positionStyle : Int -> { row : Int, col : Int } -> List ( String, String )
positionStyle size { row, col } =
    Css.asPairs
        [ property "transition" "top ease-in-out 300ms, left ease-in-out 300ms"
        , position absolute
        , top (px <| toFloat <| row * (size - 1))
        , left (px <| toFloat <| col * (size - 1))
        , width (px <| toFloat size)
        , height (px <| toFloat size)
        ]
