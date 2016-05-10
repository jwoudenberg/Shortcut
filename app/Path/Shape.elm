module Path.Shape exposing (Model(..), view)

import Html exposing (Html)
import Svg exposing (Svg, svg, g, path)
import Svg.Attributes exposing (version, viewBox, class, class, transform, d)


-- MODEL


type Model
    = DeadEnd
    | UTurn
    | LTurn
    | WideTurn
    | STurn
    | SharpTurn
    | Straight



-- VIEW


view : Model -> Bool -> Int -> Html msg
view model mirrored rotation =
    case model of
        UTurn ->
            svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , class "shortcut-box"
                ]
                [ g
                    [ class "shortcut-path-container"
                    , transform (transformString mirrored rotation)
                    ]
                    [ path
                        [ class "shortcut-path-fill"
                        , d "M 262,751 L 113,751 C 112,675 152,618 204,583 C 255,550 317,536 375,536 C 433,536 495,550 546,583 C 598,618 638,676 637,751 L 488,751 C 487,733 480,720 462,708 C 442,694 411,686 375,686 C 339,686 308,695 288,708 C 270,720 263,733 262,751 Z"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 488,751 C 487,733 480,720 462,708 C 442,694 411,686 375,686 C 339,686 308,695 288,708 C 270,720 263,733 262,751"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 113,751 C 112,675 152,618 204,583 C 255,550 317,536 375,536 C 433,536 495,550 546,583 C 598,618 638,676 637,751"
                        ]
                        []
                    ]
                ]

        LTurn ->
            svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , class "shortcut-box"
                ]
                [ g
                    [ class "shortcut-path-container"
                    , transform (transformString mirrored rotation)
                    ]
                    [ path
                        [ class "shortcut-path-fill"
                        , d "M 263,750 L 113,750 C 112,680 142,624 191,584 C 237,546 296,525 354,513 C 474,487 626,487 750,488 L 750,638 C 614,638 485,638 386,659 C 337,670 305,684 286,700 C 270,712 263,727 262,750 Z"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 113,750 C 112,680 142,624 191,584 C 237,546 296,525 354,513 C 474,487 626,487 750,488"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 750,638 C 614,638 485,638 386,659 C 337,670 305,684 286,700 C 270,712 263,727 262,750"
                        ]
                        []
                    ]
                ]

        WideTurn ->
            svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , class "shortcut-box"
                ]
                [ g
                    [ class "shortcut-path-container"
                    , transform (transformString mirrored rotation)
                    ]
                    [ path
                        [ class "shortcut-path-fill"
                        , d "M 750,112 L 750,263 C 574,263 456,306 381,381 C 306,456 262,574 262,750 L 112,750 C 112,551 162,388 275,275 C 388,162 551,112 750,112 Z"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 112,750 C 112,551 162,388 275,275 C 388,162 551,112 750,112"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 750,263 C 574,263 456,306 381,381 C 306,456 262,574 262,750"
                        ]
                        []
                    ]
                ]

        STurn ->
            svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , class "shortcut-box"
                ]
                [ g
                    [ class "shortcut-path-container"
                    , transform (transformString mirrored rotation)
                    ]
                    [ path
                        [ class "shortcut-path-fill"
                        , d "M 488,0 C 488,134 465,199 442,234 C 419,268 389,284 341,308 C 296,331 231,362 184,433 C 137,503 113,603 113,750 L 263,750 C 263,616 285,551 309,516 C 331,482 361,466 409,442 C 455,419 519,388 566,317 C 613,247 638,147 638,0 L 488,0 Z"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 263,750 C 263,616 285,551 309,516 C 331,482 361,466 409,442 C 455,419 519,388 566,317 C 613,247 638,147 638,00"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 488,0 C 488,134 465,199 442,234 C 419,268 389,284 341,308 C 296,331 231,362 184,433 C 137,503 113,603 113,750 "
                        ]
                        []
                    ]
                ]

        Straight ->
            svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , class "shortcut-box"
                ]
                [ g
                    [ class "shortcut-path-container"
                    , transform (transformString mirrored rotation)
                    ]
                    [ path
                        [ class "shortcut-path-fill"
                        , d "M 263,0 L 113,0 L 113,750 L 263,750 L 263,0 Z"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 263,750 L 263,0"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 113,0 L 113,750"
                        ]
                        []
                    ]
                ]

        SharpTurn ->
            svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , class "shortcut-box"
                ]
                [ g
                    [ class "shortcut-path-container"
                    , transform (transformString mirrored rotation)
                    ]
                    [ path
                        [ class "shortcut-path-fill"
                        , d "M 000,487 L 000,638 C 071,638 112,679 113,750 L 263,750 C 263,596 154,487 000,487 Z"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 263,750 C 263,596 154,487 000,487"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
                        , d "M 000,638 C 071,638 112,679 113,750"
                        ]
                        []
                    ]
                ]

        DeadEnd ->
            svg
                [ version "1.1"
                , viewBox "0 0 750 750"
                , class "shortcut-box"
                ]
                [ g
                    [ class "shortcut-path-container"
                    , transform (transformString mirrored rotation)
                    ]
                    [ path
                        [ class "shortcut-path-fill"
                        , d "M 263,495 C 263,390 113,390 113,495 L 113,750 L 263,750 L 263,495 Z"
                        ]
                        []
                    , path
                        [ class "shortcut-path-border"
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
