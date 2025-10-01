export type InfoBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; code: string; lang?: "css" | "javascript" | "json" | "bash" | "plain" };

export type InfoTopic = {
  key: string;
  title: string;
  subtitle?: string;
  body: InfoBlock[];
};

const topics: Record<string, InfoTopic> = {
  "median-cut": {
    key: "median-cut",
    title: "Median-Cut",
    subtitle: "Algorithmus zur Farbreduktion",
    body: [
      {
        type: "p",
        text: "Median-Cut ist ein klassisches Verfahren, um viele Farben eines Bildes auf eine gewünschte Anzahl zu reduzieren. Es teilt den Farbraum schrittweise in kleinere Kisten, bis die Zielanzahl erreicht ist.",
      },
      { type: "h", text: "Wie es arbeitet" },
      {
        type: "ul",
        items: [
          "Alle Pixel landen in einer einzigen Kiste.",
          "Die Kiste mit der größten Spannweite (Rot, Grün oder Blau) wird am Median der längsten Achse geteilt.",
          "Das wiederholt sich, bis so viele Kisten vorhanden sind, wie Farben gewünscht werden.",
          "Für jede Kiste wird der Farbdurchschnitt berechnet -- das ergibt die finale Palette.",
        ],
      },
      { type: "h", text: "Warum nicht einfach zählen?" },
      {
        type: "p",
        text: "Ein Foto enthält oft zehntausende unterschiedlicher Farbwerte, die sich im letzten Bit unterscheiden. Ohne Gruppierung wäre eine Liste unbrauchbar. Median-Cut fasst visuell ähnliche Farben zusammen.",
      },
      { type: "h", text: "Zusatzwissen: Was ist der Median?" },
      {
        type: "p",
        text: "Der Median ist der Wert in der Mitte einer sortierten Reihe. Sortiert man alle Werte der Größe nach, liegt der Median genau auf der mittleren Position.",
      },
      {
        type: "ul",
        items: [
          "Ungerade Anzahl: Der Median ist das Element in der Mitte. Für [1, 3, 6, 7, 9] ist er 6.",
          "Gerade Anzahl: Üblich ist der Durchschnitt der beiden Mittelwerte. Für [1, 3, 6, 7] liegt der Median bei 4,5.",
          "Im Vergleich zum Mittelwert: Der Median bleibt stabil, wenn es einzelne Ausreißer gibt. Ein Gehalts-Ausreißer ändert den Mittelwert spürbar, den Median dagegen kaum.",
        ],
      },
      {
        type: "p",
        text: "Bei Median-Cut wird der Median verwendet, weil er die Pixel einer Kiste in zwei gleich große Hälften teilt -- unabhängig davon, ob der Farbverlauf eine ausgefranste oder eine kompakte Verteilung hat.",
      },
    ],
  },

  quantisierung: {
    key: "quantisierung",
    title: "Farbquantisierung",
    subtitle: "Warum Farben gruppiert werden",
    body: [
      {
        type: "p",
        text: "Jedes RGB-Pixel kann eine von über 16 Millionen Farben annehmen. Ein einziger Screenshot enthält schnell tausende leicht verschiedene Töne -- zu viele für eine nützliche Palette.",
      },
      {
        type: "p",
        text: "Farbquantisierung bedeutet: Der Farbraum wird in eine gewählte Anzahl Bereiche eingeteilt, alle Pixel werden ihrem nächsten Bereich zugeordnet. So entsteht aus Chaos eine lesbare Palette.",
      },
    ],
  },

  oklch: {
    key: "oklch",
    title: "OKLCH",
    subtitle: "Moderner Farbraum für CSS",
    body: [
      {
        type: "p",
        text: "OKLCH ist ein wahrnehmungsbasierter Farbraum, der seit 2023 in allen gängigen Browsern direkt in CSS nutzbar ist. Er beschreibt Farben mit drei Werten:",
      },
      {
        type: "ul",
        items: [
          "L -- Helligkeit (0 bis 1, perzeptiv linear)",
          "C -- Chroma (Farbintensität, 0 bis ca. 0.4)",
          "H -- Farbwinkel (0 bis 360 Grad)",
        ],
      },
      {
        type: "p",
        text: "Der Vorteil gegenüber HSL: Änderungen der Helligkeit bleiben visuell konsistent, unabhängig vom Farbton.",
      },
      {
        type: "code",
        lang: "css",
        code: "color: oklch(0.78 0.04 240);",
      },
    ],
  },

  hsl: {
    key: "hsl",
    title: "HSL",
    subtitle: "Farbton, Sättigung, Helligkeit",
    body: [
      {
        type: "p",
        text: "HSL beschreibt Farben nach menschlich intuitiveren Achsen als RGB.",
      },
      {
        type: "ul",
        items: [
          "H -- Hue / Farbton (0 bis 360 Grad)",
          "S -- Saturation / Sättigung (0 bis 100 Prozent)",
          "L -- Lightness / Helligkeit (0 bis 100 Prozent)",
        ],
      },
      {
        type: "p",
        text: "Gut für schnelle Farbvariationen, aber nicht perzeptiv gleichmäßig: 50 Prozent Helligkeit wirkt in Gelb heller als in Blau.",
      },
    ],
  },

  rgb: {
    key: "rgb",
    title: "RGB",
    subtitle: "Rot, Grün, Blau",
    body: [
      {
        type: "p",
        text: "RGB beschreibt Farben als drei Werte zwischen 0 und 255 für die Kanäle Rot, Grün und Blau. So erzeugen Bildschirme Farben durch additive Mischung.",
      },
      {
        type: "code",
        lang: "css",
        code: "color: rgb(108, 92, 231);",
      },
    ],
  },

  hex: {
    key: "hex",
    title: "HEX",
    subtitle: "Hexadezimal-Schreibweise für RGB",
    body: [
      {
        type: "p",
        text: "HEX ist eine kompakte Schreibweise für RGB-Werte. Jeder Kanal wird als zweistellige Hexadezimalzahl notiert -- zusammen drei Bytes.",
      },
      {
        type: "code",
        lang: "css",
        code: "#6c5ce7 /* rgb(108, 92, 231) */",
      },
    ],
  },

  "cie2000": {
    key: "cie2000",
    title: "Delta E (CIE2000)",
    subtitle: "Farbabstand, der dem Auge entspricht",
    body: [
      {
        type: "p",
        text: "Delta E misst, wie unterschiedlich zwei Farben für den Menschen wirken. Die Version CIE2000 (oder kurz dE00) ist der aktuelle Standard und liefert deutlich bessere Ergebnisse als einfache Abstandsberechnungen im RGB-Raum.",
      },
      { type: "h", text: "Faustregel" },
      {
        type: "ul",
        items: [
          "Unter 1: praktisch identisch",
          "1 bis 3: für ein geübtes Auge unterscheidbar",
          "3 bis 6: deutlicher Unterschied",
          "Über 10: zwei verschiedene Farben",
        ],
      },
    ],
  },

  lab: {
    key: "lab",
    title: "LAB",
    subtitle: "Wahrnehmungsbasierter Farbraum",
    body: [
      {
        type: "p",
        text: "CIE L*a*b* ist ein Farbraum, der so konstruiert wurde, dass gleiche numerische Abstände möglichst gleichen empfundenen Farbunterschieden entsprechen.",
      },
      {
        type: "ul",
        items: [
          "L -- Helligkeit (0 bis 100)",
          "a -- Grün/Rot-Achse",
          "b -- Blau/Gelb-Achse",
        ],
      },
      {
        type: "p",
        text: "Grundlage für Delta-E-Berechnungen in präzisem Farbmanagement.",
      },
    ],
  },

  alpha: {
    key: "alpha",
    title: "Alpha-Kanal",
    subtitle: "Transparenz im Bild",
    body: [
      {
        type: "p",
        text: "PNG- und WEBP-Bilder können einen Alpha-Kanal enthalten: einen zusätzlichen Wert pro Pixel, der angibt, wie durchsichtig dieses Pixel ist. 0 bedeutet vollständig unsichtbar, 255 vollständig deckend.",
      },
      { type: "h", text: "In PaläddyFix" },
      {
        type: "ul",
        items: [
          "Ignorieren: durchsichtige Pixel fallen aus der Analyse raus -- saubere Paletten für Icons mit Rand.",
          "Als Faktor: durchsichtige Pixel werden mit ihrem Alpha-Anteil gewichtet -- passender für Fotos mit leichten Kanten.",
        ],
      },
    ],
  },

  downscale: {
    key: "downscale",
    title: "Downscale vor der Analyse",
    subtitle: "Warum große Bilder vor dem Zählen verkleinert werden",
    body: [
      {
        type: "p",
        text: "Ein 4K-Screenshot hat über acht Millionen Pixel. Jeden einzelnen mit Median-Cut zu verarbeiten ist verschwendete Zeit -- die Farbverteilung bleibt gleich, wenn man vorher auf z.B. 1024 Pixel Kantenlänge herunterskaliert.",
      },
      {
        type: "p",
        text: "Die Analyse wird dadurch deutlich schneller, ohne dass sich das Ergebnis ändert. Die Downscale-Grenze lässt sich in den Einstellungen anpassen.",
      },
    ],
  },

  dithering: {
    key: "dithering",
    title: "Dithering",
    subtitle: "Farbflächen mit wenig Farben simulieren",
    body: [
      {
        type: "p",
        text: "Beim Snap-to-Palette werden Bildfarben durch Paletten-Farben ersetzt. Ohne weitere Maßnahmen entstehen harte Farbblöcke. Dithering streut die Ersatzfarben in einem Muster, um weiche Übergänge zu simulieren.",
      },
      { type: "h", text: "Varianten" },
      {
        type: "ul",
        items: [
          "Floyd-Steinberg -- klassisch, verteilt den Fehler auf Nachbarn",
          "Atkinson -- kontrastreicher, früher von Apple genutzt",
          "Bayer -- gleichmäßig geordnet, retro-Wirkung",
        ],
      },
    ],
  },

  "palette-matching": {
    key: "palette-matching",
    title: "Paletten-Matching",
    subtitle: "Welche vorgegebene Palette passt am besten?",
    body: [
      {
        type: "p",
        text: "Für jede Bildfarbe wird die nächstgelegene Farbe aus der Vergleichs-Palette gesucht (per Delta-E-Distanz). Über alle Pixel gemittelt ergibt sich ein Score, der sagt, wie gut die Palette das Bild beschreibt.",
      },
      {
        type: "p",
        text: "In PaläddyFix v0.2 wird das Werkzeug ausgebaut und vergleicht das Bild mit Editor-Themes wie Solarized, Dracula, Nord, Gruvbox, Monokai und One Dark.",
      },
    ],
  },

  "indexeddb": {
    key: "indexeddb",
    title: "IndexedDB",
    subtitle: "Wo deine Bilder liegen",
    body: [
      {
        type: "p",
        text: "PaläddyFix speichert deine Bilder direkt im Browser in der IndexedDB. Dort liegt alles lokal auf deinem Rechner -- nichts wird hochgeladen. Auch die berechneten Analysen werden dort gecacht.",
      },
      {
        type: "p",
        text: "Die verfügbare Speichermenge hängt vom Browser ab, ist aber in der Regel sehr großzügig (mehrere GB). Einstellungen wie Theme und Format landen dagegen im localStorage.",
      },
    ],
  },
};

export function getTopic(key: string): InfoTopic | null {
  return topics[key] ?? null;
}

export function listTopics(): InfoTopic[] {
  return Object.values(topics);
}
