---
title: Median-Cut
subtitle: Algorithmus zur Farbreduktion
---

Median-Cut ist ein klassisches Verfahren, um viele Farben eines Bildes auf eine gewünschte Anzahl zu reduzieren. Es teilt den Farbraum schrittweise in kleinere Kisten, bis die Zielanzahl erreicht ist.

## Wie es arbeitet

- Alle Pixel landen in einer einzigen Kiste.
- Die Kiste mit der größten Spannweite (Rot, Grün oder Blau) wird am Median der längsten Achse geteilt.
- Das wiederholt sich, bis so viele Kisten vorhanden sind, wie Farben gewünscht werden.
- Für jede Kiste wird der Farbdurchschnitt berechnet -- das ergibt die finale Palette.

## Warum nicht einfach zählen?

Ein Foto enthält oft zehntausende unterschiedlicher Farbwerte, die sich im letzten Bit unterscheiden. Ohne Gruppierung wäre eine Liste unbrauchbar. Median-Cut fasst visuell ähnliche Farben zusammen.

## Zusatzwissen: Was ist der Median?

Der Median ist der Wert in der Mitte einer sortierten Reihe. Sortiert man alle Werte der Größe nach, liegt der Median genau auf der mittleren Position.

- **Ungerade Anzahl:** Der Median ist das Element in der Mitte. Für `[1, 3, 6, 7, 9]` ist er `6`.
- **Gerade Anzahl:** Üblich ist der Durchschnitt der beiden Mittelwerte. Für `[1, 3, 6, 7]` liegt der Median bei `4,5`.
- **Im Vergleich zum Mittelwert:** Der Median bleibt stabil, wenn es einzelne Ausreißer gibt. Ein Gehalts-Ausreißer ändert den Mittelwert spürbar, den Median dagegen kaum.

Bei Median-Cut wird der Median verwendet, weil er die Pixel einer Kiste in zwei gleich große Hälften teilt -- unabhängig davon, ob der Farbverlauf eine ausgefranste oder eine kompakte Verteilung hat.
