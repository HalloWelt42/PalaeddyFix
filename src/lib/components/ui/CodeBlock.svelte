<script lang="ts">
  import Prism from "prismjs";
  import "prismjs/components/prism-css";
  import "prismjs/components/prism-json";
  import "prismjs/components/prism-javascript";
  import "prismjs/components/prism-markup";
  import "prismjs/components/prism-bash";

  export type CodeLang =
    | "css"
    | "json"
    | "javascript"
    | "markup"
    | "bash"
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

  const html = $derived.by(() => {
    if (lang === "plain") return escapeHtml(code);
    const grammar = Prism.languages[lang];
    if (!grammar) return escapeHtml(code);
    return Prism.highlight(code, grammar, lang);
  });
</script>

<figure class="codeblock">
  {#if filename}
    <figcaption class="caption">{filename}</figcaption>
  {/if}
  <pre class="pre"><code class="code">{@html html}</code></pre>
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
    padding: 10px 12px;
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
