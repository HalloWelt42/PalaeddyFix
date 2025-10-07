---
title: Relative Luminanz
subtitle: Wie hell eine Farbe für das Auge wirkt
wikipedia: https://de.wikipedia.org/wiki/Luminanz
---

Die **relative Luminanz** gibt an, wie hell eine Farbe für das menschliche Auge wirkt -- auf einer Skala von 0 (reines Schwarz) bis 1 (reines Weiß).

## Berechnung

Jeder sRGB-Kanal wird zuerst linearisiert (Gamma-Korrektur umkehren), dann gewichtet addiert:

```
L = 0.2126 · R_lin + 0.7152 · G_lin + 0.0722 · B_lin
```

Grün trägt am meisten bei, weil das Auge in diesem Bereich am empfindlichsten ist. Blau dagegen wirkt dunkler als sein Farbton vermuten lässt.

## Warum es wichtig ist

Zwei Farben mit ähnlichen RGB-Werten können sehr unterschiedliche Luminanz haben. Ein knalliges Gelb wirkt fast weiß, ein sattes Violett fast schwarz -- obwohl beide "reine" Farben sind. Für Lesbarkeit zählt der Luminanzunterschied, nicht der Farbton.
