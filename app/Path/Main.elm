module Path.Main exposing (Model, Edge, view)

import Path.Shape as Shape
import Html exposing (Html)


-- MODEL


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


type alias Model =
    ( Edge, Edge )



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
                            2 * rotation

                        { shape, mirrored, rotation } =
                            toTransformedShape ( lowEdge - shift, highEdge - shift )
                    in
                        { shape = shape
                        , mirrored = mirrored
                        , rotation = (rotation + rotation)
                        }
    in
        toTransformedShape edgeNumbers
