module Card.View exposing (view)

import Card.Model exposing (Model, Path, Edge(..), Msg(..))
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Svg exposing (Attribute, Svg, g)
import Svg.Attributes exposing (version, viewBox, transform, d, class)
import Styles
import Styles


type Shape
    = DeadEnd
    | UTurn
    | LTurn
    | WideTurn
    | STurn
    | SharpTurn
    | Straight


type alias TransformedShape =
    { shape : Shape
    , mirrored : Bool
    , rotation : Int
    }


view : Model -> Html Msg
view model =
    let
        clickMsg : Msg
        clickMsg =
            if model.selected then
                Rotate
            else
                Select
    in
        div
            [ onClick clickMsg
            , style (Styles.cardStyle model.rotation model.selected)
            ]
            (List.map pathView model.paths)


pathView : Path -> Html msg
pathView path =
    let
        { shape, mirrored, rotation } =
            transformedShape path
    in
        shapeView shape mirrored rotation


transformedShape : Path -> TransformedShape
transformedShape path =
    let
        -- A numerical representation of the edges.
        edgeNumbers : ( Int, Int )
        edgeNumbers =
            ( edgeNumber (fst path)
            , edgeNumber (snd path)
            )

        -- Assign a numeric value to each edge.
        edgeNumber : Edge -> Int
        edgeNumber edge =
            case edge of
                BottomLeft ->
                    0

                BottomRight ->
                    1

                RightBottom ->
                    2

                RightTop ->
                    3

                TopRight ->
                    4

                TopLeft ->
                    5

                LeftTop ->
                    6

                LeftBottom ->
                    7

                Unconnected ->
                    8

        -- Function called recursively to reduce any set of edge numbers to a base path transformed in some way.
        toTransformedShape : ( Int, Int ) -> TransformedShape
        toTransformedShape edgeNumbers =
            case edgeNumbers of
                ( 0, 1 ) ->
                    { shape = UTurn, mirrored = False, rotation = 0 }

                ( 0, 2 ) ->
                    { shape = LTurn, mirrored = False, rotation = 0 }

                ( 0, 3 ) ->
                    { shape = WideTurn, mirrored = False, rotation = 0 }

                ( 0, 4 ) ->
                    { shape = STurn, mirrored = False, rotation = 0 }

                ( 0, 5 ) ->
                    { shape = Straight, mirrored = False, rotation = 0 }

                ( 0, 6 ) ->
                    { shape = LTurn, mirrored = False, rotation = 3 }

                ( 0, 7 ) ->
                    { shape = SharpTurn, mirrored = False, rotation = 0 }

                ( 0, 8 ) ->
                    { shape = DeadEnd, mirrored = False, rotation = 0 }

                ( 1, 8 ) ->
                    { shape = DeadEnd, mirrored = True, rotation = 0 }

                ( 1, e2 ) ->
                    let
                        { shape, mirrored, rotation } =
                            toTransformedShape ( 0, 9 - e2 )
                    in
                        { shape = shape
                        , mirrored = (not mirrored)
                        , rotation = -rotation
                        }

                ( e1, e2 ) ->
                    let
                        lowEdge =
                            Basics.min e1 e2

                        highEdge =
                            Basics.max e1 e2

                        rotation' =
                            lowEdge // 2

                        shift =
                            2 * rotation'

                        baseShape =
                            toTransformedShape ( lowEdge - shift, highEdge - shift )
                    in
                        { baseShape
                            | rotation = baseShape.rotation + rotation'
                        }
    in
        toTransformedShape edgeNumbers


shapeView : Shape -> Bool -> Int -> Html msg
shapeView path mirrored rotation =
    case path of
        UTurn ->
            Svg.svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , style Styles.pathStyle
                ]
                [ g
                    [ style Styles.pathContainerStyle
                    , transform (transformString mirrored rotation)
                    ]
                    [ Svg.path
                        [ style Styles.pathFillStyle
                        , d "M 262,751 L 113,751 C 112,675 152,618 204,583 C 255,550 317,536 375,536 C 433,536 495,550 546,583 C 598,618 638,676 637,751 L 488,751 C 487,733 480,720 462,708 C 442,694 411,686 375,686 C 339,686 308,695 288,708 C 270,720 263,733 262,751 Z"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 488,751 C 487,733 480,720 462,708 C 442,694 411,686 375,686 C 339,686 308,695 288,708 C 270,720 263,733 262,751"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 113,751 C 112,675 152,618 204,583 C 255,550 317,536 375,536 C 433,536 495,550 546,583 C 598,618 638,676 637,751"
                        ]
                        []
                    ]
                ]

        LTurn ->
            Svg.svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , style Styles.pathStyle
                ]
                [ g
                    [ style Styles.pathContainerStyle
                    , transform (transformString mirrored rotation)
                    ]
                    [ Svg.path
                        [ style Styles.pathFillStyle
                        , d "M 263,750 L 113,750 C 112,680 142,624 191,584 C 237,546 296,525 354,513 C 474,487 626,487 750,488 L 750,638 C 614,638 485,638 386,659 C 337,670 305,684 286,700 C 270,712 263,727 262,750 Z"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 113,750 C 112,680 142,624 191,584 C 237,546 296,525 354,513 C 474,487 626,487 750,488"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 750,638 C 614,638 485,638 386,659 C 337,670 305,684 286,700 C 270,712 263,727 262,750"
                        ]
                        []
                    ]
                ]

        WideTurn ->
            Svg.svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , style Styles.pathStyle
                ]
                [ g
                    [ style Styles.pathContainerStyle
                    , transform (transformString mirrored rotation)
                    ]
                    [ Svg.path
                        [ style Styles.pathFillStyle
                        , d "M 750,112 L 750,263 C 574,263 456,306 381,381 C 306,456 262,574 262,750 L 112,750 C 112,551 162,388 275,275 C 388,162 551,112 750,112 Z"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 112,750 C 112,551 162,388 275,275 C 388,162 551,112 750,112"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 750,263 C 574,263 456,306 381,381 C 306,456 262,574 262,750"
                        ]
                        []
                    ]
                ]

        STurn ->
            Svg.svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , style Styles.pathStyle
                ]
                [ g
                    [ style Styles.pathContainerStyle
                    , transform (transformString mirrored rotation)
                    ]
                    [ Svg.path
                        [ style Styles.pathFillStyle
                        , d "M 488,0 C 488,134 465,199 442,234 C 419,268 389,284 341,308 C 296,331 231,362 184,433 C 137,503 113,603 113,750 L 263,750 C 263,616 285,551 309,516 C 331,482 361,466 409,442 C 455,419 519,388 566,317 C 613,247 638,147 638,0 L 488,0 Z"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 263,750 C 263,616 285,551 309,516 C 331,482 361,466 409,442 C 455,419 519,388 566,317 C 613,247 638,147 638,00"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 488,0 C 488,134 465,199 442,234 C 419,268 389,284 341,308 C 296,331 231,362 184,433 C 137,503 113,603 113,750 "
                        ]
                        []
                    ]
                ]

        Straight ->
            Svg.svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , style Styles.pathStyle
                ]
                [ g
                    [ style Styles.pathContainerStyle
                    , transform (transformString mirrored rotation)
                    ]
                    [ Svg.path
                        [ style Styles.pathFillStyle
                        , d "M 263,0 L 113,0 L 113,750 L 263,750 L 263,0 Z"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 263,750 L 263,0"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 113,0 L 113,750"
                        ]
                        []
                    ]
                ]

        SharpTurn ->
            Svg.svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , style Styles.pathStyle
                ]
                [ g
                    [ style Styles.pathContainerStyle
                    , transform (transformString mirrored rotation)
                    ]
                    [ Svg.path
                        [ style Styles.pathFillStyle
                        , d "M 000,487 L 000,638 C 071,638 112,679 113,750 L 263,750 C 263,596 154,487 000,487 Z"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 263,750 C 263,596 154,487 000,487"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 000,638 C 071,638 112,679 113,750"
                        ]
                        []
                    ]
                ]

        DeadEnd ->
            Svg.svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , style Styles.pathStyle
                ]
                [ g
                    [ style Styles.pathContainerStyle
                    , transform (transformString mirrored rotation)
                    ]
                    [ Svg.path
                        [ style Styles.pathFillStyle
                        , d "M 263,495 C 263,390 113,390 113,495 L 113,750 L 263,750 L 263,495 Z"
                        ]
                        []
                    , Svg.path
                        [ style Styles.pathBorderStyle
                        , d "M 263,750 L 263,495 C 263,390 113,390 113,495 L 113,750"
                        ]
                        []
                    ]
                ]


transformString : Bool -> Int -> String
transformString mirrored rotation =
    let
        mirrorString =
            "scale(-1 1) translate(-750, 0)"

        turnString : Int -> String
        turnString rotation =
            "rotate(" ++ toString (rotation * 90) ++ " 375 375)"
    in
        if mirrored then
            mirrorString ++ " " ++ turnString rotation
        else
            turnString rotation
