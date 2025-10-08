---
title: ANSI-16
subtitle: Klassische Terminal-Farben
wikipedia: https://de.wikipedia.org/wiki/ANSI-Escapesequenz
---

Die ANSI-16-Palette besteht aus den klassischen 16 Farben, die seit den frühen Tagen der Textterminals per ANSI-Escape-Sequenzen gesteuert werden: 8 Grundfarben (Schwarz, Rot, Grün, Gelb, Blau, Magenta, Cyan, Weiß) plus deren „hell"-Varianten.

## Wie es funktioniert

In der Shell werden diese Farben per Steuercodes wie `\x1b[31m` (rot) gesetzt und mit `\x1b[0m` zurückgesetzt. Jeder Terminal-Emulator interpretiert die Codes und rendert die Zeichen in der entsprechenden Farbe.

## Historische Bedeutung

Die Palette stammt aus einer Zeit, als Monitore nur wenige Farben gleichzeitig darstellen konnten. Sie ist bis heute der kleinste gemeinsame Nenner: jeder Terminal-Emulator auf jedem Betriebssystem unterstützt sie. Die genauen RGB-Werte variieren zwischen Terminals (die "rot" in xterm ist nicht ganz das gleiche wie in iTerm) -- daher gibt es auch viele Custom-ANSI-Paletten wie Solarized oder Gruvbox, die dieselben 16 Slots neu einfärben.

## Typischer Einsatz

Als Referenz für Shell- und CLI-Entwicklung, für Syntax-Highlighting im Terminal oder um sicherzustellen, dass ein Farbschema auch auf sehr alten Systemen sichtbar bleibt.
