module Path.View (pathElement) where

import Path.Model exposing (Path, Edge(..))
import Path.Svg
import Html exposing (Html)


type TransformedShape
    = TransformedShape Path.Svg.Shape Path.Svg.Mirrored Path.Svg.Rotation


pathElement : Path -> Html
pathElement path =
    case (transformedShape path) of
        TransformedShape shape mirrored rotation ->
            Path.Svg.svgElement shape mirrored rotation


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
                    TransformedShape Path.Svg.UTurn False 0

                ( 0, 2 ) ->
                    TransformedShape Path.Svg.LTurn False 0

                ( 0, 3 ) ->
                    TransformedShape Path.Svg.WideTurn False 0

                ( 0, 4 ) ->
                    TransformedShape Path.Svg.STurn False 0

                ( 0, 5 ) ->
                    TransformedShape Path.Svg.Straight False 0

                ( 0, 6 ) ->
                    TransformedShape Path.Svg.LTurn False 3

                ( 0, 7 ) ->
                    TransformedShape Path.Svg.SharpTurn False 0

                ( 0, 8 ) ->
                    TransformedShape Path.Svg.DeadEnd False 0

                ( 1, 8 ) ->
                    TransformedShape Path.Svg.DeadEnd True 0

                ( 1, e2 ) ->
                    case (toTransformedShape ( 0, 9 - e2 )) of
                        TransformedShape transformedShape mirrored turns ->
                            TransformedShape transformedShape (not mirrored) -turns

                ( e1, e2 ) ->
                    let
                        lowEdge = min e1 e2

                        highEdge = max e1 e2

                        turns = lowEdge // 2

                        shift = 2 * turns
                    in
                        case (toTransformedShape ( lowEdge - shift, highEdge - shift )) of
                            TransformedShape transformedShape mirrored turns' ->
                                TransformedShape transformedShape mirrored (turns' + turns)
    in
        toTransformedShape edgeNumbers
