module Card.View (cardElement) where

import Card.Model exposing (..)
import Path.View
import Html exposing (..)
import Html.Attributes exposing (..)


cardElement : Card -> Html
cardElement card =
    div
        [ class "shortcut-card shortcut-box" ]
        (List.map Path.View.pathElement card.paths)
