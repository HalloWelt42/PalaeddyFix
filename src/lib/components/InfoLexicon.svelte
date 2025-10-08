<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { info } from "../stores/info.svelte";
  import { ui } from "../stores/ui.svelte";
  import { listTopics, getTopic, type InfoTopic } from "../info/topics";

  const allTopics: InfoTopic[] = listTopics().sort((a, b) =>
    a.title.localeCompare(b.title, "de"),
  );

  let searchInput = $state<HTMLInputElement | null>(null);
  let articleEl = $state<HTMLElement | null>(null);

  const selectedTopic = $derived<InfoTopic | null>(
    info.topicKey ? getTopic(info.topicKey) : null,
  );

  const normalized = $derived(info.query.trim().toLowerCase());

  const listMatches = $derived.by(() => {
    if (!normalized) return allTopics;
    return allTopics.filter((t) => {
      const text = (t.title + " " + (t.subtitle ?? "") + " " + t.markdown).toLowerCase();
      return text.includes(normalized);
    });
  });

  const matchCount = $derived.by(() => {
    if (!normalized || !selectedTopic) return 0;
    const text = selectedTopic.markdown.toLowerCase();
    let count = 0;
    let idx = 0;
    while (idx !== -1) {
      idx = text.indexOf(normalized, idx);
      if (idx === -1) break;
      count++;
      idx += normalized.length;
    }
    return count;
  });

  const articleHtml = $derived.by(() => {
    if (!selectedTopic) return "";
    if (!normalized) return selectedTopic.html;
    return highlightHtml(selectedTopic.html, normalized, info.matchIndex);
  });

  function highlightHtml(html: string, needle: string, activeIdx: number): string {
    const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null;
    if (!parser) return html;
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const container = doc.body.firstElementChild as HTMLElement | null;
    if (!container) return html;

    const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const matches: { node: Text; start: number; end: number }[] = [];
    let node: Node | null = walker.nextNode();
    while (node) {
      const text = node.nodeValue ?? "";
      const lower = text.toLowerCase();
      let from = 0;
      let pos = lower.indexOf(needle, from);
      while (pos !== -1) {
        matches.push({ node: node as Text, start: pos, end: pos + needle.length });
        from = pos + needle.length;
        pos = lower.indexOf(needle, from);
      }
      node = walker.nextNode();
    }

    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      const original = m.node.nodeValue ?? "";
      const before = original.slice(0, m.start);
      const middle = original.slice(m.start, m.end);
      const after = original.slice(m.end);
      const mark = doc.createElement("mark");
      mark.textContent = middle;
      mark.className = i === activeIdx ? "hit hit-active" : "hit";
      mark.setAttribute("data-hit", String(i));
      const afterNode = doc.createTextNode(after);
      const beforeNode = doc.createTextNode(before);
      const parent = m.node.parentNode;
      if (!parent) continue;
      parent.insertBefore(beforeNode, m.node);
      parent.insertBefore(mark, m.node);
      parent.insertBefore(afterNode, m.node);
      parent.removeChild(m.node);
    }
    return container.innerHTML;
  }

  function scrollActiveIntoView(): void {
    if (!articleEl) return;
    const active = articleEl.querySelector(".hit-active");
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  $effect(() => {
    void articleHtml;
    void info.matchIndex;
    queueMicrotask(scrollActiveIntoView);
  });

  $effect(() => {
    if (ui.activeLeft === "info") {
      queueMicrotask(() => searchInput?.focus());
    }
  });

  function onKey(e: KeyboardEvent): void {
    if (e.key !== "Enter") return;
    if (matchCount === 0) return;
    e.preventDefault();
    if (e.shiftKey) info.prevMatch(matchCount);
    else info.nextMatch(matchCount);
  }

  function selectTopic(key: string): void {
    info.select(key);
    queueMicrotask(() => {
      articleEl?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    });
  }

  function clearQuery(): void {
    info.setQuery("");
    searchInput?.focus();
  }
</script>

<section class="lexicon">
  <header class="head">
    <div class="title">
      <Icon name="info" size={16} />
      <h2>Info-Lexikon</h2>
      <span class="sub">{allTopics.length} Artikel</span>
    </div>
    <button
      type="button"
      class="close"
      title="Schließen"
      onclick={() => ui.setLeft(null)}
    >
      <Icon name="x" size={14} />
    </button>
  </header>

  <div class="body">
    <aside class="sidebar">
      <div class="search">
        <Icon name="search" size={12} />
        <input
          bind:this={searchInput}
          type="text"
          placeholder="Volltext durchsuchen …"
          value={info.query}
          oninput={(e) => info.setQuery((e.currentTarget as HTMLInputElement).value)}
          onkeydown={onKey}
        />
        {#if info.query}
          <button type="button" class="clear" title="Suche leeren" onclick={clearQuery}>
            <Icon name="x" size={10} />
          </button>
        {/if}
      </div>

      <ul class="topic-list">
        {#each listMatches as t (t.key)}
          <li>
            <button
              type="button"
              class="topic-btn"
              class:active={info.topicKey === t.key}
              onclick={() => selectTopic(t.key)}
            >
              <span class="topic-title">{t.title}</span>
              {#if t.subtitle}
                <span class="topic-sub">{t.subtitle}</span>
              {/if}
            </button>
          </li>
        {:else}
          <li class="empty-hit">Keine Treffer</li>
        {/each}
      </ul>
    </aside>

    <article class="article" bind:this={articleEl}>
      {#if selectedTopic}
        <div class="article-head">
          <h1>{selectedTopic.title}</h1>
          {#if selectedTopic.subtitle}
            <p class="subtitle">{selectedTopic.subtitle}</p>
          {/if}
          {#if info.query && matchCount > 0}
            <div class="hit-info">
              <span>
                {matchCount} Treffer{matchCount === 1 ? "" : ""} für „{info.query}" --
                Treffer {info.matchIndex + 1}/{matchCount}
              </span>
              <span class="kbd-hint">
                <kbd>⏎</kbd> nächster, <kbd>⇧⏎</kbd> voriger
              </span>
            </div>
          {:else if info.query && matchCount === 0}
            <div class="hit-info muted">
              Im aktuellen Artikel keine Treffer für „{info.query}".
            </div>
          {/if}
        </div>
        <div class="prose">
          {@html articleHtml}
        </div>
        {#if selectedTopic.wikipedia}
          <p class="wiki-foot">
            Weiterlesen auf
            <a href={selectedTopic.wikipedia} target="_blank" rel="noopener noreferrer">Wikipedia</a>
          </p>
        {/if}
      {:else}
        <div class="blank">
          <Icon name="info" size={32} />
          <h3>Info-Lexikon</h3>
          <p>
            Hier findest du alle Fachbegriffe und Hintergrund-Artikel, die im
            Rest der App mit <Icon name="info" size={10} /> markiert sind. Wähle
            links einen Artikel oder suche im Volltext nach einem Begriff.
          </p>
          <p class="sub">
            Drücke <kbd>⏎</kbd> im Suchfeld, um durch Treffer im aktuellen
            Artikel zu springen, <kbd>⇧⏎</kbd> für den vorigen.
          </p>
        </div>
      {/if}
    </article>
  </div>
</section>

<style>
  .lexicon {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    min-height: 0;
    background: var(--bg);
  }
  .head {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--info);
  }
  .title h2 {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }
  .title .sub {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-mute);
    margin-left: 4px;
  }
  .close {
    width: 28px;
    height: 28px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-dim);
    cursor: pointer;
    display: grid;
    place-items: center;
    border-radius: var(--radius-btn);
  }
  .close:hover {
    color: var(--text);
    background: var(--surface-2);
  }

  .body {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 0;
  }
  .sidebar {
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--surface);
  }
  .search {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .search :global(.ic) {
    color: var(--text-mute);
    flex-shrink: 0;
  }
  .search input {
    flex: 1;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 6px 10px;
    font-family: var(--font-sans);
    font-size: 12px;
    border-radius: var(--radius-btn);
    outline: none;
    min-width: 0;
  }
  .search input:focus {
    border-color: var(--info-line);
  }
  .clear {
    width: 22px;
    height: 22px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-dim);
    cursor: pointer;
    display: grid;
    place-items: center;
    border-radius: 50%;
  }
  .clear:hover {
    color: var(--text);
    background: var(--surface-3);
  }

  .topic-list {
    list-style: none;
    padding: 4px 0;
    margin: 0;
    overflow: auto;
    flex: 1;
  }
  .topic-btn {
    width: 100%;
    background: transparent;
    border: 0;
    border-left: 2px solid transparent;
    color: var(--text-dim);
    padding: 7px 14px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .topic-btn:hover {
    background: var(--surface-2);
    color: var(--text);
  }
  .topic-btn.active {
    background: var(--info-soft);
    border-left-color: var(--info);
    color: var(--text);
  }
  .topic-title {
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 600;
  }
  .topic-sub {
    font-family: var(--font-button);
    font-size: 10px;
    color: var(--text-mute);
  }
  .empty-hit {
    padding: 14px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-mute);
    text-align: center;
  }

  .article {
    overflow: auto;
    padding: 24px 32px 40px;
    min-height: 0;
  }
  .article-head {
    position: sticky;
    top: -24px;
    background: var(--bg);
    padding: 24px 0 12px;
    margin: -24px 0 14px;
    border-bottom: 1px solid var(--border);
    z-index: 1;
  }
  .article-head h1 {
    font-family: var(--font-button);
    font-size: 22px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.3px;
    margin: 0;
  }
  .subtitle {
    font-family: var(--font-button);
    font-size: 13px;
    color: var(--text-dim);
    margin: 4px 0 0;
  }
  .hit-info {
    margin-top: 10px;
    padding: 6px 10px;
    background: var(--info-soft);
    border: 1px solid var(--info-line);
    border-radius: var(--radius-btn);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text);
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .hit-info.muted {
    background: var(--surface-2);
    border-color: var(--border);
    color: var(--text-dim);
  }
  .kbd-hint {
    color: var(--text-dim);
  }
  kbd {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    padding: 1px 5px;
    border-radius: 3px;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 10px;
  }

  .prose {
    font-family: var(--font-button);
    font-size: 14px;
    line-height: 1.65;
    color: var(--text);
    max-width: 720px;
  }
  .prose :global(h2) {
    font-family: var(--font-button);
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    margin: 20px 0 8px;
    letter-spacing: 0.3px;
  }
  .prose :global(h3) {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    margin: 16px 0 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .prose :global(p) {
    margin: 0 0 10px;
  }
  .prose :global(ul),
  .prose :global(ol) {
    margin: 0 0 10px;
    padding-left: 22px;
  }
  .prose :global(li) {
    margin-bottom: 4px;
  }
  .prose :global(code) {
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .prose :global(a) {
    color: var(--info);
  }
  .prose :global(mark.hit) {
    background: var(--accent-soft);
    color: var(--text);
    padding: 0 2px;
    border-radius: 2px;
  }
  .prose :global(mark.hit-active) {
    background: var(--accent);
    color: var(--bg);
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .wiki-foot {
    max-width: 720px;
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
    font-family: var(--font-button);
    font-size: 12px;
    color: var(--text-dim);
  }
  .wiki-foot a {
    color: var(--info);
  }

  .blank {
    max-width: 480px;
    margin: 60px auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--text-dim);
  }
  .blank :global(.ic) {
    color: var(--text-mute);
  }
  .blank h3 {
    font-family: var(--font-button);
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }
  .blank p {
    font-family: var(--font-button);
    font-size: 13px;
    line-height: 1.55;
  }
  .blank .sub {
    font-size: 12px;
    color: var(--text-mute);
  }
</style>
