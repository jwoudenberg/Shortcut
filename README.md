# Shortcut

Shortcut is web-based card-laying game.
Players have to bases between which they must create a route, by drawing, placing and rotating cards.

This is a project I originally started to learn Javascript (old version sits in the master branch).
Recently, I've picked it up again as a way to spend some time with some newer frontend libraries.

I'm using [React.js](https://pozadi.github.io/kefir/#) as my view layer.
[Kefir](https://pozadi.github.io/kefir/#) will serve as my FRP library for building the rule logic.
I'm inspired by the Haskell library [Gloss](https://hackage.haskell.org/package/gloss), where you basically create a
game by specifying some data structure to represent it's state, an event handler and a render function. React.js is the
render function, Kefir will be my event handler.

I have some vague ideas for a server component, so I'm using browserify in preparation for the moment I'd like to run
the rule logic server-side too.
Should that happen, I'd like to store the state of games using event sourcing (the state of the game is the result of
turns taken), and I'd like to exchange these turns using websockets.

So many plans but so little time. We'll see where this ship strands.
