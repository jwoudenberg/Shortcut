# Shortcut version 0.1
Shortcut is web-based card-laying game. Players have to bases between which
they must create a route, by drawing, placing and rotating cards.

This is a project I started to learn Javascript. Since then I've repeatedly
changed my goals, to learn about new types of problems, new technologies and
new frameworks.

## Technologies
Shortcut makes use of inline-SVG for the paths. That way it is very easy to
control the way the game looks using CSS. Also, the graphics are completely
scalable.

Backbone is used to provide an underlying structure for the code, and requireJS
is used to split that structure in chunks with explicitely defined dependencies.