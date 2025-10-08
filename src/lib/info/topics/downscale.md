---
title: Downscale vor der Analyse
subtitle: Warum große Bilder vor dem Zählen verkleinert werden
wikipedia: https://de.wikipedia.org/wiki/Skalierung_(Computergrafik)
---

Ein 4K-Screenshot hat über acht Millionen Pixel. Jeden einzelnen mit Median-Cut zu verarbeiten ist verschwendete Zeit -- die Farbverteilung bleibt gleich, wenn man vorher auf z.B. 1024 Pixel Kantenlänge herunterskaliert.

Die Analyse wird dadurch deutlich schneller, ohne dass sich das Ergebnis ändert. Die Downscale-Grenze lässt sich in den Einstellungen anpassen.
