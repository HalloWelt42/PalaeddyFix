---
title: Kontrastverhältnis
subtitle: Maß für den Helligkeitsunterschied zweier Farben
wikipedia: https://de.wikipedia.org/wiki/Kontrast
---

Das **Kontrastverhältnis** misst den Unterschied der **relativen Luminanz** zweier Farben. Es ist die Grundlage der WCAG-Lesbarkeits-Prüfung.

## Formel

```
Ratio = (L_hell + 0.05) / (L_dunkel + 0.05)
```

- L_hell ist die Luminanz der helleren Farbe
- L_dunkel die der dunkleren
- Der Offset 0.05 verhindert Division durch Null und entspricht dem Umgebungslicht

## Skala

- **1 : 1** -- identisch, kein Kontrast
- **3 : 1** -- Minimum für Großtext und UI
- **4.5 : 1** -- Minimum für Normaltext (AA)
- **7 : 1** -- AAA-Stufe
- **21 : 1** -- maximaler Wert, Schwarz auf Weiß
