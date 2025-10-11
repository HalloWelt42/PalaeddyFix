<script lang="ts">
  import Prism from "prismjs";
  import "prismjs/components/prism-css";
  import "prismjs/components/prism-json";
  import "prismjs/components/prism-javascript";
  import "prismjs/components/prism-markup";
  import "prismjs/components/prism-bash";
  import "prismjs/components/prism-scss";
  import "prismjs/components/prism-less";
  import "prismjs/components/prism-swift";
  import "prismjs/components/prism-kotlin";
  import "prismjs/components/prism-dart";
  import "prismjs/components/prism-python";

  export type CodeLang =
    | "css"
    | "json"
    | "javascript"
    | "markup"
    | "bash"
    | "scss"
    | "less"
    | "swift"
    | "kotlin"
    | "dart"
    | "python"
    | "plain";

  type Props = {
    code: string;
    lang?: CodeLang;
    filename?: string;
  };

  const { code, lang = "plain", filename }: Props = $props();

  function escapeHtml(s: string): string {
    return s.replace(/[&<>]/g, (c) =>
      c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;",
    );
  }

  function parseColorFromLine(line: string): string | null {
    const hex8 = line.match(/#[0-9a-fA-F]{8}\b/);
    if (hex8) return hex8[0];
    const hex6 = line.match(/#[0-9a-fA-F]{6}\b/);
    if (hex6) return hex6[0];
    const hex3 = line.match(/#[0-9a-fA-F]{3}\b/);
    if (hex3) return hex3[0];

    const rgba = line.match(/rgba?\(\s*\d+[\s,]+\d+[\s,]+\d+(?:[\s,/]+[0-9.]+%?)?\s*\)/i);
    if (rgba) return rgba[0];

    const hsla = line.match(/hsla?\(\s*\d+[\s,]+\d+%?[\s,]+\d+%?(?:[\s,/]+[0-9.]+%?)?\s*\)/i);
    if (hsla) return hsla[0];

    const oklch = line.match(/oklch\([^)]+\)/i);
    if (oklch) return oklch[0];

    // 0xAARRGGBB oder 0xFFRRGGBB (Kotlin/Dart/Swift)
    const argb = line.match(/0x([0-9a-fA-F]{8})\b/);
    if (argb) {
      const v = argb[1];
      return `#${v.slice(2)}`;
    }

    // Python tuple: "(r, g, b)" mit Zahlen 0-255, muss mindestens dreistellig sein
    const tuple = line.match(/\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d{1,3}))?\s*\)/);
    if (tuple) {
      const r = Number(tuple[1]);
      const g = Number(tuple[2]);
      const b = Number(tuple[3]);
      if ([r, g, b].every((n) => n >= 0 && n <= 255)) {
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    // Swift: Color(red: 0.xxx, green: ..., blue: ...)
    const sw = line.match(/red:\s*([0-9.]+)[^g]+green:\s*([0-9.]+)[^b]+blue:\s*([0-9.]+)/);
    if (sw) {
      const r = Math.round(Number(sw[1]) * 255);
      const g = Math.round(Number(sw[2]) * 255);
      const b = Math.round(Number(sw[3]) * 255);
      return `rgb(${r}, ${g}, ${b})`;
    }

    return null;
  }

  const html = $derived.by(() => {
    if (lang === "plain") return escapeHtml(code);
    const grammar = Prism.languages[lang];
    if (!grammar) return escapeHtml(code);
    return Prism.highlight(code, grammar, lang);
  });

  const lines = $derived.by(() => {
    const htmlLines = html.split("\n");
    const textLines = code.split("\n");
    return htmlLines.map((h, i) => ({
      html: h,
      color: parseColorFromLine(textLines[i] ?? ""),
    }));
  });
</script>

<figure class="codeblock">
  {#if filename}
    <figcaption class="caption">{filename}</figcaption>
  {/if}
  <pre class="pre"><code class="code"
    >{#each lines as line, i (i)}<span class="row"><span
          class="gutter"
          style={line.color ? `background: ${line.color}` : ""}
          aria-hidden="true"></span><span class="line"
          >{@html line.html || "&nbsp;"}</span></span>{#if i < lines.length - 1}{"\n"}{/if}{/each}</code></pre>
</figure>

<style>
  .codeblock {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 3px;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.55;
  }
  .caption {
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
    color: var(--text-dim);
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .pre {
    padding: 10px 0;
    margin: 0;
    overflow: auto;
    color: var(--text);
    white-space: pre;
  }
  .code {
    background: none;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    padding: 0;
    display: block;
  }
  .row {
    display: inline-grid;
    grid-template-columns: 10px 1fr;
    gap: 8px;
    width: 100%;
    align-items: stretch;
  }
  .gutter {
    display: inline-block;
    width: 10px;
    height: 1.55em;
    border-right: 1px solid var(--border);
    background: transparent;
  }
  .line {
    display: inline-block;
    padding-right: 12px;
  }

  .pre :global(.token.comment),
  .pre :global(.token.prolog),
  .pre :global(.token.doctype),
  .pre :global(.token.cdata) {
    color: var(--text-mute);
    font-style: italic;
  }
  .pre :global(.token.punctuation) {
    color: var(--text-dim);
  }
  .pre :global(.token.property),
  .pre :global(.token.tag),
  .pre :global(.token.constant),
  .pre :global(.token.symbol),
  .pre :global(.token.deleted) {
    color: var(--text);
    font-weight: 600;
  }
  .pre :global(.token.boolean),
  .pre :global(.token.number) {
    color: var(--text);
    font-weight: 500;
    text-decoration: underline;
    text-decoration-color: var(--border-strong);
    text-underline-offset: 3px;
  }
  .pre :global(.token.selector),
  .pre :global(.token.attr-name),
  .pre :global(.token.string),
  .pre :global(.token.char),
  .pre :global(.token.builtin),
  .pre :global(.token.inserted) {
    color: var(--text);
  }
  .pre :global(.token.string) {
    opacity: 0.85;
  }
  .pre :global(.token.operator),
  .pre :global(.token.entity),
  .pre :global(.token.url) {
    color: var(--text-dim);
  }
  .pre :global(.token.atrule),
  .pre :global(.token.attr-value),
  .pre :global(.token.keyword) {
    color: var(--text);
    font-weight: 700;
  }
  .pre :global(.token.function),
  .pre :global(.token.class-name) {
    color: var(--text);
    font-weight: 600;
  }
  .pre :global(.token.regex),
  .pre :global(.token.important),
  .pre :global(.token.variable) {
    color: var(--text);
  }
</style>
