module Path.Main exposing (Model, view)

import Path.Edge as Edge
import Path.Shape as Shape
import Html exposing (Html)


-- MODEL


type alias Model =
    ( Edge.Model, Edge.Model )



---- View ----


type alias TransformedShape =
    { shape : Shape.Model
    , mirrored : Bool
    , rotation : Int
    }


view : Model -> Html msg
view model =
    let
        { shape, mirrored, rotation } =
            transformedShape model
    in
        Shape.view shape mirrored rotation


transformedShape : Model -> TransformedShape
transformedShape model =
    let
        -- A numerical representation of the edges.
        edgeNumbers : ( Int, Int )
        edgeNumbers =
            ( edgeNumber (fst model)
            , edgeNumber (snd model)
            )

        -- Assign a numeric value to each edge.
        edgeNumber : Edge.Model -> Int
        edgeNumber edge =
            case edge of
                Edge.BottomLeft ->
                    0

                Edge.BottomRight ->
                    1

                Edge.RightBottom ->
                    2

                Edge.RightTop ->
                    3

                Edge.TopRight ->
                    4

                Edge.TopLeft ->
                    5

                Edge.LeftTop ->
                    6

                Edge.LeftBottom ->
                    7

                Edge.Unconnected ->
                    8

        -- Function called recursively to reduce any set of edge numbers to a base path transformed in some way.
        toTransformedShape : ( Int, Int ) -> TransformedShape
        toTransformedShape edgeNumbers =
            case edgeNumbers of
                ( 0, 1 ) ->
                    { shape = Shape.UTurn, mirrored = False, rotation = 0 }

                ( 0, 2 ) ->
                    { shape = Shape.LTurn, mirrored = False, rotation = 0 }

                ( 0, 3 ) ->
                    { shape = Shape.WideTurn, mirrored = False, rotation = 0 }

                ( 0, 4 ) ->
                    { shape = Shape.STurn, mirrored = False, rotation = 0 }

                ( 0, 5 ) ->
                    { shape = Shape.Straight, mirrored = False, rotation = 0 }

                ( 0, 6 ) ->
                    { shape = Shape.LTurn, mirrored = False, rotation = 3 }

                ( 0, 7 ) ->
                    { shape = Shape.SharpTurn, mirrored = False, rotation = 0 }

                ( 0, 8 ) ->
                    { shape = Shape.DeadEnd, mirrored = False, rotation = 0 }

                ( 1, 8 ) ->
                    { shape = Shape.DeadEnd, mirrored = True, rotation = 0 }

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
                            min e1 e2

                        highEdge =
                            max e1 e2

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
