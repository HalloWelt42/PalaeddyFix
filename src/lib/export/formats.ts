import type { PaletteColor } from "../storage/schema";

export type ExportFormat =
  | "hex"
  | "css"
  | "scss"
  | "less"
  | "tailwind"
  | "json"
  | "csv"
  | "gpl"
  | "svg"
  | "swift"
  | "kotlin"
  | "dart"
  | "python";

export type ExportCategory = "web" | "native" | "tool" | "data";

export type ExportDescriptor = {
  id: ExportFormat;
  label: string;
  category: ExportCategory;
  categoryLabel: string;
};

export const EXPORT_DESCRIPTORS: ExportDescriptor[] = [
  { id: "hex", label: "HEX-Liste", category: "data", categoryLabel: "Daten" },
  { id: "json", label: "JSON", category: "data", categoryLabel: "Daten" },
  { id: "csv", label: "CSV", category: "data", categoryLabel: "Daten" },

  { id: "css", label: "CSS Custom Properties", category: "web", categoryLabel: "Web" },
  { id: "scss", label: "SCSS Variablen", category: "web", categoryLabel: "Web" },
  { id: "less", label: "LESS Variablen", category: "web", categoryLabel: "Web" },
  { id: "tailwind", label: "Tailwind Config", category: "web", categoryLabel: "Web" },

  { id: "swift", label: "Swift UIColor", category: "native", categoryLabel: "Native" },
  { id: "kotlin", label: "Kotlin Compose", category: "native", categoryLabel: "Native" },
  { id: "dart", label: "Dart / Flutter", category: "native", categoryLabel: "Native" },
  { id: "python", label: "Python Liste", category: "native", categoryLabel: "Native" },

  { id: "gpl", label: "GIMP Palette", category: "tool", categoryLabel: "Werkzeuge" },
  { id: "svg", label: "SVG Swatches", category: "tool", categoryLabel: "Werkzeuge" },
];

export type ExportOutput = {
  filename: string;
  mime: string;
  lang: "plain" | "css" | "javascript" | "json" | "markup" | "bash" | "scss" | "less" | "swift" | "kotlin" | "dart" | "python";
  content: string;
};

function slug(i: number): string {
  return (i + 1).toString().padStart(2, "0");
}

function swiftFloat(n: number): string {
  return (n / 255).toFixed(4);
}

export function exportHexList(colors: PaletteColor[]): ExportOutput {
  const content = colors.map((c) => c.hex).join("\n") + "\n";
  return { filename: "palette.txt", mime: "text/plain", lang: "plain", content };
}

export function exportCss(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = [":root {"];
  colors.forEach((c, i) => {
    lines.push(`  --color-${slug(i)}: ${c.hex}; /* ${c.percent.toFixed(1)}% */`);
  });
  lines.push("}", "");
  return { filename: "palette.css", mime: "text/css", lang: "css", content: lines.join("\n") };
}

export function exportScss(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = [];
  colors.forEach((c, i) => {
    lines.push(`$color-${slug(i)}: ${c.hex}; // ${c.percent.toFixed(1)}%`);
  });
  lines.push("");
  lines.push("$palette: (");
  colors.forEach((c, i) => {
    const sep = i === colors.length - 1 ? "" : ",";
    lines.push(`  "${slug(i)}": ${c.hex}${sep}`);
  });
  lines.push(");", "");
  return { filename: "palette.scss", mime: "text/x-scss", lang: "scss", content: lines.join("\n") };
}

export function exportLess(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = [];
  colors.forEach((c, i) => {
    lines.push(`@color-${slug(i)}: ${c.hex}; // ${c.percent.toFixed(1)}%`);
  });
  lines.push("");
  return { filename: "palette.less", mime: "text/x-less", lang: "less", content: lines.join("\n") };
}

export function exportTailwind(colors: PaletteColor[]): ExportOutput {
  const entries = colors.map((c, i) => `      "${slug(i)}": "${c.hex}",`).join("\n");
  const content =
    `module.exports = {\n` +
    `  theme: {\n` +
    `    extend: {\n` +
    `      colors: {\n` +
    `        palette: {\n` +
    entries +
    `\n        },\n` +
    `      },\n` +
    `    },\n` +
    `  },\n` +
    `};\n`;
  return {
    filename: "tailwind.colors.js",
    mime: "text/javascript",
    lang: "javascript",
    content,
  };
}

export function exportJson(colors: PaletteColor[]): ExportOutput {
  const data = colors.map((c) => ({
    hex: c.hex,
    rgb: c.rgb,
    percent: Number(c.percent.toFixed(3)),
    count: c.count,
  }));
  return {
    filename: "palette.json",
    mime: "application/json",
    lang: "json",
    content: JSON.stringify(data, null, 2) + "\n",
  };
}

export function exportCsv(colors: PaletteColor[]): ExportOutput {
  const lines = ["index,hex,r,g,b,count,percent"];
  colors.forEach((c, i) => {
    lines.push(
      [
        slug(i),
        c.hex,
        c.rgb[0],
        c.rgb[1],
        c.rgb[2],
        c.count,
        c.percent.toFixed(3),
      ].join(","),
    );
  });
  lines.push("");
  return { filename: "palette.csv", mime: "text/csv", lang: "plain", content: lines.join("\n") };
}

export function exportGpl(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = [
    "GIMP Palette",
    "Name: PalaeddyFix Export",
    "Columns: 8",
    "#",
  ];
  colors.forEach((c, i) => {
    const pad = (n: number) => n.toString().padStart(3, " ");
    lines.push(
      `${pad(c.rgb[0])} ${pad(c.rgb[1])} ${pad(c.rgb[2])}\tColor ${slug(i)}`,
    );
  });
  lines.push("");
  return {
    filename: "palette.gpl",
    mime: "text/plain",
    lang: "plain",
    content: lines.join("\n"),
  };
}

export function exportSvg(colors: PaletteColor[]): ExportOutput {
  const cols = Math.max(1, Math.ceil(Math.sqrt(colors.length)));
  const size = 80;
  const rows = Math.ceil(colors.length / cols);
  const w = cols * size;
  const h = rows * size;
  const rects: string[] = [];
  colors.forEach((c, i) => {
    const x = (i % cols) * size;
    const y = Math.floor(i / cols) * size;
    rects.push(
      `  <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${c.hex}"><title>${c.hex} -- ${c.percent.toFixed(1)}%</title></rect>`,
    );
  });
  const content =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n` +
    rects.join("\n") +
    `\n</svg>\n`;
  return {
    filename: "palette.svg",
    mime: "image/svg+xml",
    lang: "markup",
    content,
  };
}

export function exportSwift(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = [
    "import SwiftUI",
    "",
    "extension Color {",
  ];
  colors.forEach((c, i) => {
    const [r, g, b] = c.rgb;
    lines.push(
      `    static let palette${slug(i)} = Color(red: ${swiftFloat(r)}, green: ${swiftFloat(g)}, blue: ${swiftFloat(b)})`,
    );
  });
  lines.push("}", "");
  return {
    filename: "Palette.swift",
    mime: "text/x-swift",
    lang: "swift",
    content: lines.join("\n"),
  };
}

export function exportKotlin(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = ["import androidx.compose.ui.graphics.Color", ""];
  colors.forEach((c, i) => {
    const hex = c.hex.replace("#", "").toUpperCase();
    lines.push(`val Palette${slug(i)} = Color(0xFF${hex})`);
  });
  lines.push("");
  return {
    filename: "Palette.kt",
    mime: "text/x-kotlin",
    lang: "kotlin",
    content: lines.join("\n"),
  };
}

export function exportDart(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = [
    "import 'package:flutter/material.dart';",
    "",
    "class PaletteColors {",
  ];
  colors.forEach((c, i) => {
    const hex = c.hex.replace("#", "").toUpperCase();
    lines.push(`  static const Color palette${slug(i)} = Color(0xFF${hex});`);
  });
  lines.push("}", "");
  return {
    filename: "palette.dart",
    mime: "text/x-dart",
    lang: "dart",
    content: lines.join("\n"),
  };
}

export function exportPython(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = [
    '"""Auto-generiert von PalaeddyFix."""',
    "",
    "palette = [",
  ];
  colors.forEach((c) => {
    lines.push(`    (${c.rgb[0]}, ${c.rgb[1]}, ${c.rgb[2]}),  # ${c.hex}`);
  });
  lines.push("]", "", "hex_palette = [");
  colors.forEach((c) => {
    lines.push(`    "${c.hex}",`);
  });
  lines.push("]", "");
  return {
    filename: "palette.py",
    mime: "text/x-python",
    lang: "python",
    content: lines.join("\n"),
  };
}

export function runExport(format: ExportFormat, colors: PaletteColor[]): ExportOutput {
  switch (format) {
    case "hex": return exportHexList(colors);
    case "css": return exportCss(colors);
    case "scss": return exportScss(colors);
    case "less": return exportLess(colors);
    case "tailwind": return exportTailwind(colors);
    case "json": return exportJson(colors);
    case "csv": return exportCsv(colors);
    case "gpl": return exportGpl(colors);
    case "svg": return exportSvg(colors);
    case "swift": return exportSwift(colors);
    case "kotlin": return exportKotlin(colors);
    case "dart": return exportDart(colors);
    case "python": return exportPython(colors);
  }
}

export function downloadOutput(out: ExportOutput): void {
  const blob = new Blob([out.content], { type: out.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = out.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
