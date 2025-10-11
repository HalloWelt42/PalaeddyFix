<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import { info } from "../stores/info.svelte";
  import { ui } from "../stores/ui.svelte";
  import { listTopics, getTopic, type InfoTopic } from "../info/topics";
  import { fetchWikipediaSummary, loadCachedWikipedia, stripHtml, type WikipediaResult } from "../info/wikipedia";

  const allTopics: InfoTopic[] = listTopics().sort((a, b) =>
    a.title.localeCompare(b.title, "de"),
  );

  let searchInput = $state<HTMLInputElement | null>(null);
  let articleEl = $state<HTMLElement | null>(null);
  let wikiTextEl = $state<HTMLElement | null>(null);
  let sidebarOpen = $state<boolean>(
    typeof localStorage !== "undefined" ? localStorage.getItem("lexicon-sidebar") !== "closed" : true,
  );
  let wholeWord = $state<boolean>(
    typeof localStorage !== "undefined" ? localStorage.getItem("lexicon-ww") === "1" : false,
  );
  let wikiTexts = $state<Record<string, string>>({});

  function toggleWholeWord(): void {
    wholeWord = !wholeWord;
    try {
      localStorage.setItem("lexicon-ww", wholeWord ? "1" : "0");
    } catch { /* ignore */ }
  }

  function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function buildSearchRegex(needle: string, whole: boolean): RegExp | null {
    if (!needle) return null;
    const esc = escapeRegex(needle);
    const pattern = whole ? `\\b${esc}\\b` : esc;
    try {
      return new RegExp(pattern, "gi");
    } catch {
      return null;
    }
  }

  function countMatches(text: string, needle: string, whole: boolean): number {
    if (!needle) return 0;
    if (!whole) {
      let count = 0;
      let idx = 0;
      const lower = text.toLowerCase();
      const n = needle.toLowerCase();
      while (idx !== -1) {
        idx = lower.indexOf(n, idx);
        if (idx === -1) break;
        count++;
        idx += n.length;
      }
      return count;
    }
    const re = buildSearchRegex(needle, true);
    if (!re) return 0;
    return (text.match(re) ?? []).length;
  }

  async function loadWikiTexts(): Promise<void> {
    const next: Record<string, string> = {};
    for (const t of allTopics) {
      if (!t.wikipedia) continue;
      const cached = await loadCachedWikipedia(t.wikipedia);
      if (cached?.articleHtml) {
        next[t.key] = stripHtml(cached.articleHtml);
      } else if (cached?.extract) {
        next[t.key] = cached.extract;
      }
    }
    wikiTexts = next;
  }

  $effect(() => {
    void info.prewarmDone;
    void loadWikiTexts();
  });

  function toggleSidebar(): void {
    sidebarOpen = !sidebarOpen;
    try {
      localStorage.setItem("lexicon-sidebar", sidebarOpen ? "open" : "closed");
    } catch {
      /* ignore */
    }
  }

  let wikiData = $state<WikipediaResult | null>(null);
  let wikiLoading = $state<boolean>(false);
  let wikiError = $state<string | null>(null);
  let currentWikiUrl = $state<string | null>(null);

  const selectedTopic = $derived<InfoTopic | null>(
    info.topicKey ? getTopic(info.topicKey) : null,
  );

  $effect(() => {
    const url = selectedTopic?.wikipedia ?? null;
    if (url === currentWikiUrl) return;
    currentWikiUrl = url;
    if (!url) {
      wikiData = null;
      wikiLoading = false;
      wikiError = null;
      return;
    }
    wikiData = null;
    wikiLoading = true;
    wikiError = null;
    void (async () => {
      try {
        const result = await fetchWikipediaSummary(url);
        if (currentWikiUrl === url) {
          wikiData = result;
          wikiError = result ? null : "Kein Wikipedia-Artikel gefunden.";
        }
      } catch (err) {
        if (currentWikiUrl === url) {
          wikiError = err instanceof Error ? err.message : String(err);
        }
      } finally {
        if (currentWikiUrl === url) wikiLoading = false;
      }
    })();
  });

  async function reloadWiki(): Promise<void> {
    if (!selectedTopic?.wikipedia) return;
    wikiLoading = true;
    wikiError = null;
    try {
      const result = await fetchWikipediaSummary(selectedTopic.wikipedia, { force: true });
      wikiData = result;
    } catch (err) {
      wikiError = err instanceof Error ? err.message : String(err);
    } finally {
      wikiLoading = false;
    }
  }

  $effect(() => {
    const el = wikiTextEl;
    if (!el) return;
    void wikiData;
    void selectedTopic;
    queueMicrotask(() => {
      if (!el) return;
      const topicUrl = selectedTopic?.wikipedia;
      const pageUrl = wikiData?.pageUrl ?? topicUrl ?? "";
      const host = topicUrl ? safeHost(topicUrl) : "";
      for (const a of Array.from(el.querySelectorAll("a"))) {
        const href = a.getAttribute("href") ?? "";
        if (!href) {
          if (pageUrl) a.setAttribute("href", pageUrl);
        } else if (href.startsWith("#")) {
          if (pageUrl) a.setAttribute("href", `${pageUrl}${href}`);
        } else if (href.startsWith("./")) {
          if (host) a.setAttribute("href", `https://${host}/wiki/${href.slice(2)}`);
        } else if (href.startsWith("//")) {
          a.setAttribute("href", `https:${href}`);
        } else if (href.startsWith("/")) {
          if (host) a.setAttribute("href", `https://${host}${href}`);
        }
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });
  });

  function safeHost(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return "";
    }
  }

  function formatAge(ts: number): string {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return "gerade eben";
    if (mins < 60) return `vor ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `vor ${hours} h`;
    const days = Math.round(hours / 24);
    return `vor ${days} Tag${days === 1 ? "" : "en"}`;
  }

  const normalized = $derived(info.query.trim().toLowerCase().replace(/\s+/g, " "));

  function normalizeWs(s: string): string {
    return s.toLowerCase().replace(/\s+/g, " ");
  }

  const listMatches = $derived.by(() => {
    if (!normalized) return allTopics;
    if (!wholeWord) {
      return allTopics.filter((t) => {
        const own = normalizeWs(t.title + " " + (t.subtitle ?? "") + " " + t.markdown);
        if (own.includes(normalized)) return true;
        const wiki = normalizeWs(wikiTexts[t.key] ?? "");
        return wiki.includes(normalized);
      });
    }
    const re = buildSearchRegex(info.query.trim(), true);
    if (!re) return allTopics;
    return allTopics.filter((t) => {
      const own = normalizeWs(t.title + " " + (t.subtitle ?? "") + " " + t.markdown);
      re.lastIndex = 0;
      if (re.test(own)) return true;
      const wiki = normalizeWs(wikiTexts[t.key] ?? "");
      re.lastIndex = 0;
      return re.test(wiki);
    });
  });

  const currentWikiText = $derived.by(() => {
    if (!selectedTopic) return "";
    return wikiTexts[selectedTopic.key] ?? "";
  });
  const currentWikiMatches = $derived.by(() => {
    if (!normalized || !currentWikiText) return 0;
    return countMatches(normalizeWs(currentWikiText), info.query.trim(), wholeWord);
  });

  const matchCount = $derived.by(() => {
    if (!normalized || !selectedTopic) return 0;
    return countMatches(normalizeWs(selectedTopic.markdown), info.query.trim(), wholeWord);
  });

  const totalMatchCount = $derived(matchCount + currentWikiMatches);

  const activeOwnIdx = $derived(info.matchIndex < matchCount ? info.matchIndex : -1);
  const activeWikiIdx = $derived(
    info.matchIndex >= matchCount ? info.matchIndex - matchCount : -1,
  );

  const articleHtml = $derived.by(() => {
    if (!selectedTopic) return "";
    if (!normalized) return selectedTopic.html;
    return highlightHtml(selectedTopic.html, normalized, activeOwnIdx);
  });

  function highlightHtml(html: string, needle: string, activeIdx: number): string {
    const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null;
    if (!parser) return html;
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const container = doc.body.firstElementChild as HTMLElement | null;
    if (!container) return html;

    const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const matches: { node: Text; start: number; end: number }[] = [];
    const re = wholeWord ? buildSearchRegex(info.query.trim(), true) : null;
    let node: Node | null = walker.nextNode();
    while (node) {
      const text = node.nodeValue ?? "";
      if (re) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          matches.push({ node: node as Text, start: m.index, end: m.index + m[0].length });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        const lower = text.toLowerCase();
        let from = 0;
        let pos = lower.indexOf(needle, from);
        while (pos !== -1) {
          matches.push({ node: node as Text, start: pos, end: pos + needle.length });
          from = pos + needle.length;
          pos = lower.indexOf(needle, from);
        }
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
    const inArticle = articleEl?.querySelector(".hit-active") ?? null;
    const inWiki = wikiTextEl?.querySelector(".hit-active") ?? null;
    const target = inArticle ?? inWiki;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    if (totalMatchCount === 0) return;
    e.preventDefault();
    if (e.shiftKey) info.prevMatch(totalMatchCount);
    else info.nextMatch(totalMatchCount);
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
    <button
      type="button"
      class="sidebar-toggle"
      title={sidebarOpen ? "Artikelliste ausblenden" : "Artikelliste einblenden"}
      onclick={toggleSidebar}
    >
      <Icon name={sidebarOpen ? "x" : "grid"} size={14} />
    </button>
    <div class="title">
      <Icon name="info" size={16} />
      <h2>Info-Lexikon</h2>
      <span class="sub">
        {allTopics.length} Artikel
        {#if info.prewarmTotal > 0 && info.prewarmDone < info.prewarmTotal}
          · Wikipedia {info.prewarmDone}/{info.prewarmTotal}
        {/if}
      </span>
    </div>
    <div class="search">
      <Icon name="search" size={12} />
      <input
        bind:this={searchInput}
        type="text"
        placeholder={wholeWord ? "Ganze Wörter / exakte Sätze …" : "Volltext durchsuchen …"}
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
    <button
      type="button"
      class="ww-toggle"
      class:active={wholeWord}
      title={wholeWord ? "Ganzes Wort / Satz (aktiv)" : "Ganze Wörter / exakte Sätze"}
      onclick={toggleWholeWord}
    >
      Ab
    </button>
    {#if info.query && totalMatchCount > 0}
      <span class="hit-badge">
        {totalMatchCount} Treffer
        {#if currentWikiMatches > 0}
          ({matchCount}+{currentWikiMatches} Wiki)
        {/if}
        {#if totalMatchCount > 0}
          · {info.matchIndex + 1}/{totalMatchCount}
        {/if}
      </span>
    {:else if info.query && totalMatchCount === 0}
      <span class="hit-badge muted">Keine Treffer</span>
    {/if}
    <button
      type="button"
      class="close end"
      title="Lexikon schließen"
      onclick={() => ui.setLeft(null)}
    >
      <Icon name="x" size={14} />
    </button>
  </header>

  <div class="body" class:sidebar-collapsed={!sidebarOpen}>
    {#if sidebarOpen}
    <aside class="sidebar">
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
    {/if}

    <article class="article" bind:this={articleEl}>
      {#if selectedTopic}
        <div class="article-head">
          <h1>{selectedTopic.title}</h1>
          {#if selectedTopic.subtitle}
            <p class="subtitle">{selectedTopic.subtitle}</p>
          {/if}
        </div>

        <div class="prose">
          {@html articleHtml}
        </div>

        {#if selectedTopic.wikipedia}
          <section class="wiki-block">
            <header class="wiki-head">
              <div class="wiki-title">
                <span class="wiki-badge">Wikipedia</span>
                {#if wikiData}
                  <span class="wiki-meta">
                    {wikiData.lang.toUpperCase()} · {wikiData.fromCache
                      ? `Cache ${formatAge(wikiData.fetchedAt)}`
                      : "frisch geladen"}
                  </span>
                {/if}
              </div>
              <div class="wiki-actions">
                <button
                  type="button"
                  class="wiki-btn"
                  title="Neu laden"
                  onclick={() => void reloadWiki()}
                  disabled={wikiLoading}
                >
                  <Icon name="download" size={11} /> Aktualisieren
                </button>
                <a
                  class="wiki-btn"
                  href={wikiData?.pageUrl ?? selectedTopic.wikipedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Auf Wikipedia öffnen"
                >
                  <Icon name="info" size={11} /> Artikel öffnen
                </a>
              </div>
            </header>

            {#if wikiLoading}
              <div class="wiki-state">
                <Icon name="info" size={18} />
                <p>Lade von {new URL(selectedTopic.wikipedia).host} …</p>
              </div>
            {:else if wikiError}
              <div class="wiki-state error">
                <p>{wikiError}</p>
                <button type="button" class="wiki-btn" onclick={() => void reloadWiki()}>
                  Erneut versuchen
                </button>
              </div>
            {:else if wikiData}
              {@const wikiBody = wikiData.articleHtml ?? wikiData.extractHtml ?? ""}
              {@const wikiRendered = normalized && wikiBody ? highlightHtml(wikiBody, normalized, activeWikiIdx) : wikiBody}
              <div class="wiki-body">
                {#if wikiData.thumbnail}
                  <a
                    class="wiki-image"
                    href={wikiData.originalImage?.source ?? wikiData.thumbnail.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Originalbild öffnen"
                  >
                    <img
                      src={wikiData.thumbnail.source}
                      alt={wikiData.title}
                      loading="lazy"
                    />
                  </a>
                {/if}
                <div class="wiki-text" bind:this={wikiTextEl}>
                  <h3>{wikiData.title}</h3>
                  {#if wikiData.description}
                    <p class="wiki-desc">{wikiData.description}</p>
                  {/if}
                  {#if wikiRendered}
                    {@html wikiRendered}
                  {:else if wikiData.extract}
                    <p>{wikiData.extract}</p>
                  {/if}
                </div>
              </div>
              <footer class="wiki-foot">
                Quelle: <a
                  href={wikiData.pageUrl ?? selectedTopic.wikipedia}
                  target="_blank"
                  rel="noopener noreferrer">Wikipedia</a
                >
                · Inhalte unter
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/deed.de"
                  target="_blank"
                  rel="noopener noreferrer">CC BY-SA 4.0</a
                >
                · Auto-Cache 30 Tage
              </footer>
            {/if}
          </section>
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
    padding: 0 10px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    gap: 10px;
  }
  .sidebar-toggle {
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-dim);
    cursor: pointer;
    display: grid;
    place-items: center;
    border-radius: var(--radius-btn);
    flex-shrink: 0;
  }
  .sidebar-toggle:hover {
    color: var(--text);
    background: var(--surface-2);
    border-color: var(--border-strong);
  }
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--info);
    flex-shrink: 0;
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
  .close.end {
    border: 1px solid var(--border);
    background: var(--surface-2);
  }
  .ww-toggle {
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-dim);
    cursor: pointer;
    display: grid;
    place-items: center;
    border-radius: var(--radius-btn);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .ww-toggle:hover {
    color: var(--text);
    background: var(--surface-2);
    border-color: var(--border-strong);
  }
  .ww-toggle.active {
    color: var(--accent);
    border-color: var(--accent-line);
    background: var(--accent-soft);
  }
  .hit-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    background: var(--info-soft);
    border: 1px solid var(--info-line);
    color: var(--info);
    font-family: var(--font-mono);
    font-size: 10px;
    border-radius: 10px;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }
  .hit-badge.muted {
    background: var(--surface-2);
    border-color: var(--border);
    color: var(--text-mute);
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
  .body.sidebar-collapsed {
    grid-template-columns: 1fr;
  }
  .sidebar {
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--surface);
  }
  .search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    max-width: 520px;
    position: relative;
  }
  .search :global(.fa-magnifying-glass) {
    position: absolute;
    left: 10px;
    pointer-events: none;
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
    padding: 6px 10px 6px 28px;
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
    position: absolute;
    right: 6px;
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
  .wiki-block {
    margin-top: 28px;
    background: var(--surface);
    border: 1px solid var(--info-line);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 0 4px var(--info-soft);
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
  .prose :global(mark.hit),
  .wiki-text :global(mark.hit) {
    background: var(--accent);
    color: var(--bg);
    padding: 0 2px;
    border-radius: 2px;
  }
  .prose :global(mark.hit-active),
  .wiki-text :global(mark.hit-active) {
    background: var(--ok);
    color: var(--bg);
    outline: none;
  }

  .wiki-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
    gap: 12px;
    flex-wrap: wrap;
  }
  .wiki-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wiki-badge {
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--bg);
    background: var(--info);
    padding: 3px 8px;
    border-radius: 10px;
  }
  .wiki-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
  }
  .wiki-actions {
    display: inline-flex;
    gap: 6px;
  }
  .wiki-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-radius: 12px;
    color: var(--text-dim);
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s;
  }
  .wiki-btn:hover:not(:disabled) {
    border-color: var(--info);
    color: var(--info);
  }
  .wiki-btn:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .wiki-body {
    overflow: auto;
    padding: 16px 20px 20px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 20px;
    align-items: start;
  }
  .wiki-image {
    display: block;
    flex-shrink: 0;
    border: 1px solid var(--border);
    overflow: hidden;
    border-radius: 3px;
    max-width: 240px;
  }
  .wiki-image img {
    display: block;
    width: 100%;
    height: auto;
  }
  .wiki-text {
    font-family: var(--font-button);
    font-size: 13px;
    line-height: 1.6;
    color: var(--text);
    min-width: 0;
  }
  .wiki-text h3 {
    font-family: var(--font-button);
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 4px;
  }
  .wiki-desc {
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 10px;
  }
  .wiki-text :global(p) {
    margin: 0 0 10px;
  }
  .wiki-text :global(a) {
    color: var(--info);
  }
  .wiki-text :global(b),
  .wiki-text :global(strong) {
    color: var(--text);
  }
  .wiki-text :global(h2) {
    font-family: var(--font-button);
    font-size: 15px;
    font-weight: 700;
    margin: 18px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
  }
  .wiki-text :global(h3) {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 700;
    margin: 14px 0 6px;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .wiki-text :global(h4),
  .wiki-text :global(h5) {
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 600;
    margin: 10px 0 4px;
    color: var(--text);
  }
  .wiki-text :global(ul),
  .wiki-text :global(ol) {
    margin: 0 0 10px;
    padding-left: 22px;
  }
  .wiki-text :global(li) {
    margin-bottom: 4px;
  }
  .wiki-text :global(img) {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--border);
    border-radius: 3px;
  }
  .wiki-text :global(.mwe-math-element),
  .wiki-text :global(img.mwe-math-fallback-image-inline),
  .wiki-text :global(img.mwe-math-fallback-image-display),
  .wiki-text :global(img[src*="render.svg"]),
  .wiki-text :global(img[src*="wikimedia.org/api/rest_v1/media/math"]) {
    background: #c8c8cc;
    border: 0;
    padding: 2px 4px;
    border-radius: 2px;
    vertical-align: middle;
  }
  .wiki-text :global(figure img),
  .wiki-text :global(.thumb img),
  .wiki-text :global(.thumbinner img),
  .wiki-text :global(a.image img),
  .wiki-text :global(a.mw-file-description img) {
    background: #c8c8cc;
    padding: 4px;
  }

  .wiki-text :global(ul.gallery),
  .wiki-text :global(.gallery) {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    margin: 12px 0;
    gap: 10px;
  }
  .wiki-text :global(li.gallerybox),
  .wiki-text :global(.gallerybox) {
    list-style: none;
    margin: 0 !important;
    padding: 8px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 3px;
    flex: 0 1 160px;
    width: 160px !important;
    max-width: 200px !important;
    min-width: 140px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .wiki-text :global(.gallerybox .thumb),
  .wiki-text :global(.gallerybox .thumbinner),
  .wiki-text :global(.gallerybox .gallerytextwrapper) {
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    width: auto !important;
    max-width: 100% !important;
    min-height: 0 !important;
    height: auto !important;
  }
  .wiki-text :global(.gallerybox img) {
    max-width: 100% !important;
    width: auto !important;
    height: auto !important;
  }
  .wiki-text :global(.gallerytext) {
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-dim);
    text-align: center;
    padding: 2px;
  }
  .wiki-text :global(.gallerytext p) {
    margin: 0;
  }
  .wiki-text :global(figure) {
    margin: 10px 0;
  }
  .wiki-text :global(figcaption) {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 4px;
    line-height: 1.4;
  }
  .wiki-text :global(table) {
    border-collapse: collapse;
    font-size: 12px;
    margin: 8px 0;
    max-width: 100%;
    background: var(--surface) !important;
    color: var(--text) !important;
    border: 1px solid var(--border);
  }
  .wiki-text :global(th),
  .wiki-text :global(td) {
    border: 1px solid var(--border) !important;
    padding: 4px 8px;
    text-align: left;
    vertical-align: top;
    background: transparent !important;
    color: var(--text) !important;
  }
  .wiki-text :global(th) {
    background: var(--surface-2) !important;
    font-weight: 600;
  }
  .wiki-text :global(table a) {
    color: var(--info) !important;
  }
  .wiki-text :global(.mw-editsection),
  .wiki-text :global(.mw-empty-elt),
  .wiki-text :global(.reference-accessdate),
  .wiki-text :global(.mw-cite-backlink),
  .wiki-text :global(.hatnote),
  .wiki-text :global(.navbox),
  .wiki-text :global(.metadata.mbox-small),
  .wiki-text :global(.noprint) {
    display: none !important;
  }
  .wiki-text :global(.infobox) {
    float: right;
    max-width: 240px;
    margin: 0 0 12px 14px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 8px;
    font-size: 11px;
  }
  .wiki-text :global(.infobox img) {
    max-width: 100%;
  }
  .wiki-text :global(.thumb),
  .wiki-text :global(.thumbinner) {
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 6px;
    margin: 8px 0;
    max-width: 100%;
  }
  .wiki-text :global(.thumbcaption) {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.4;
  }
  .wiki-text :global(.reference) {
    font-size: 9px;
    vertical-align: super;
    line-height: 1;
  }
  .wiki-text :global(.reflist),
  .wiki-text :global(.references) {
    font-size: 11px;
    color: var(--text-dim);
  }
  .wiki-text :global(code) {
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 11px;
  }

  .wiki-state {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--text-dim);
    font-family: var(--font-button);
    font-size: 12px;
  }
  .wiki-state.error {
    color: var(--err);
  }
  .wiki-foot {
    padding: 8px 20px;
    border-top: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-mute);
    background: var(--surface-2);
  }
  .wiki-foot a {
    color: var(--info);
  }

  @media (max-width: 900px) {
    .wiki-body {
      grid-template-columns: 1fr;
    }
    .wiki-image {
      max-width: 320px;
    }
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
