import type { PaletteColor } from "../storage/schema";

export type ExportFormat = "hex" | "css" | "tailwind" | "json";

export type ExportOutput = {
  filename: string;
  mime: string;
  lang: "plain" | "css" | "javascript" | "json";
  content: string;
};

export function exportHexList(colors: PaletteColor[]): ExportOutput {
  const content = colors.map((c) => c.hex).join("\n") + "\n";
  return {
    filename: "palette.txt",
    mime: "text/plain",
    lang: "plain",
    content,
  };
}

export function exportCss(colors: PaletteColor[]): ExportOutput {
  const lines: string[] = [":root {"];
  for (let i = 0; i < colors.length; i++) {
    const c = colors[i];
    lines.push(
      `  --color-${i + 1}: ${c.hex}; /* ${c.percent.toFixed(1)}% */`,
    );
  }
  lines.push("}", "");
  return {
    filename: "palette.css",
    mime: "text/css",
    lang: "css",
    content: lines.join("\n"),
  };
}

export function exportTailwind(colors: PaletteColor[]): ExportOutput {
  const entries: string[] = [];
  for (let i = 0; i < colors.length; i++) {
    const n = (i + 1).toString().padStart(2, "0");
    entries.push(`      "${n}": "${colors[i].hex}",`);
  }
  const content =
    `module.exports = {\n` +
    `  theme: {\n` +
    `    extend: {\n` +
    `      colors: {\n` +
    `        palette: {\n` +
    entries.join("\n") +
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

export function runExport(
  format: ExportFormat,
  colors: PaletteColor[],
): ExportOutput {
  switch (format) {
    case "hex":
      return exportHexList(colors);
    case "css":
      return exportCss(colors);
    case "tailwind":
      return exportTailwind(colors);
    case "json":
      return exportJson(colors);
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
