<script lang="ts">
  import Icon from "./ui/Icon.svelte";
  import CodeBlock from "./ui/CodeBlock.svelte";
  import { info } from "../stores/info.svelte";
  import { getTopic, topicAsPlainText } from "../info/topics";

  const topic = $derived(info.topicKey ? getTopic(info.topicKey) : null);

  let copied = $state<boolean>(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  async function copyContent(): Promise<void> {
    if (!topic) return;
    const text = topicAsPlainText(topic);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    copied = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1400);
  }

  let dragState: {
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null = null;

  let resizeState: {
    startX: number;
    startY: number;
    origW: number;
    origH: number;
  } | null = null;

  function onDragStart(e: PointerEvent): void {
    if (info.maximized) return;
    const tgt = e.target as HTMLElement;
    if (tgt.closest(".ctrl")) return;
    if (e.button !== 0) return;
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      origX: info.x,
      origY: info.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onDragMove(e: PointerEvent): void {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 40;
    info.setPosition(
      Math.max(-40, Math.min(maxX, dragState.origX + dx)),
      Math.max(0, Math.min(maxY, dragState.origY + dy)),
    );
  }

  function onDragEnd(e: PointerEvent): void {
    if (!dragState) return;
    dragState = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    info.save();
  }

  function onResizeStart(e: PointerEvent): void {
    if (info.maximized || info.minimized) return;
    e.stopPropagation();
    resizeState = {
      startX: e.clientX,
      startY: e.clientY,
      origW: info.width,
      origH: info.height,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onResizeMove(e: PointerEvent): void {
    if (!resizeState) return;
    const dx = e.clientX - resizeState.startX;
    const dy = e.clientY - resizeState.startY;
    info.setSize(resizeState.origW + dx, resizeState.origH + dy);
  }

  function onResizeEnd(e: PointerEvent): void {
    if (!resizeState) return;
    resizeState = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    info.save();
  }

  const panelStyle = $derived.by(() => {
    if (info.maximized) {
      return `left: 24px; top: 24px; width: calc(100vw - 48px); height: calc(100vh - 48px);`;
    }
    if (info.minimized) {
      return `left: ${info.x}px; top: ${info.y}px; width: ${info.width}px; height: 44px;`;
    }
    return `left: ${info.x}px; top: ${info.y}px; width: ${info.width}px; height: ${info.height}px;`;
  });
</script>

{#if info.open && topic}
  <div
    class="floating"
    style={panelStyle}
    class:minimized={info.minimized}
    class:maximized={info.maximized}
    role="dialog"
    aria-label={topic.title}
  >
    <div
      class="drag-head"
      onpointerdown={onDragStart}
      onpointermove={onDragMove}
      onpointerup={onDragEnd}
      onpointercancel={onDragEnd}
      role="toolbar"
    >
      <div class="drag-title">
        <Icon name="info" size={28} />
        <div class="t">
          <span class="k">{topic.title}</span>
          {#if topic.subtitle}<span class="s">{topic.subtitle}</span>{/if}
        </div>
      </div>
      <div class="ctrl">
        <button
          type="button"
          class="ctrl-btn copy-btn"
          class:copied
          title={copied ? "In Zwischenablage" : "Inhalt kopieren"}
          onclick={copyContent}
        >
          <Icon name={copied ? "check" : "copy"} size={12} />
        </button>
        <button
          type="button"
          class="ctrl-btn"
          title={info.minimized ? "Vergrößern" : "Minimieren"}
          onclick={() => info.toggleMinimized()}
        >
          <span class="mini"></span>
        </button>
        <button
          type="button"
          class="ctrl-btn"
          title={info.maximized ? "Normale Größe" : "Vollgröße"}
          onclick={() => info.toggleMaximized()}
        >
          <span class="maxi"></span>
        </button>
        <button type="button" class="ctrl-btn" title="Schließen" onclick={() => info.close()}>
          <Icon name="x" size={12} />
        </button>
      </div>
    </div>

    {#if !info.minimized}
      <div class="content">
        {#each topic.body as block, i (i)}
          {#if block.type === "p"}
            <p>{block.text}</p>
          {:else if block.type === "h"}
            <h4>{block.text}</h4>
          {:else if block.type === "ul"}
            <ul>
              {#each block.items as item (item)}
                <li>{item}</li>
              {/each}
            </ul>
          {:else if block.type === "code"}
            <CodeBlock code={block.code} lang={block.lang ?? "plain"} />
          {/if}
        {/each}
      </div>

      <div
        class="resize"
        onpointerdown={onResizeStart}
        onpointermove={onResizeMove}
        onpointerup={onResizeEnd}
        onpointercancel={onResizeEnd}
        role="presentation"
      ></div>
    {/if}
  </div>
{/if}

<style>
  .floating {
    position: fixed;
    background: var(--surface);
    border: 1px solid var(--info-line);
    display: grid;
    grid-template-rows: 44px 1fr;
    box-shadow: 0 20px 56px #0008;
    z-index: 80;
    user-select: none;
    min-width: 280px;
    min-height: 44px;
  }
  .floating.minimized {
    grid-template-rows: 44px;
  }

  .drag-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid var(--info-line);
    background: var(--info-soft);
    cursor: grab;
    touch-action: none;
  }
  .drag-head:active {
    cursor: grabbing;
  }
  .maximized .drag-head {
    cursor: default;
  }

  .drag-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .t {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .t .k {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 600;
    color: var(--info);
    letter-spacing: 0.3px;
  }
  .t .s {
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 500;
    color: var(--text-dim);
  }
  .drag-title :global(svg) {
    color: var(--info);
  }

  .ctrl {
    display: flex;
    gap: 2px;
  }
  .ctrl-btn {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-dim);
    cursor: pointer;
    border-radius: var(--radius-btn);
  }
  .ctrl-btn:hover {
    color: var(--text);
    background: var(--surface);
    border-color: var(--border);
  }
  .copy-btn.copied {
    color: var(--info);
    border-color: var(--info-line);
    background: var(--info-soft);
  }
  .mini {
    display: block;
    width: 10px;
    height: 2px;
    background: currentColor;
  }
  .maxi {
    display: block;
    width: 10px;
    height: 10px;
    border: 1.5px solid currentColor;
  }

  .content {
    padding: 20px 24px;
    overflow: auto;
    font-family: var(--font-button);
    font-size: 17px;
    font-weight: 500;
    line-height: 1.6;
    color: var(--text);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .content p {
    font-family: var(--font-button);
    font-size: 17px;
    font-weight: 500;
    color: var(--text);
  }
  .content h4 {
    font-family: var(--font-button);
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }
  .content ul {
    margin: 0;
    padding-left: 22px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .content li {
    font-family: var(--font-button);
    font-size: 16px;
    font-weight: 500;
    color: var(--text);
  }

  .resize {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 18px;
    height: 18px;
    cursor: se-resize;
    background:
      linear-gradient(
        135deg,
        transparent 0 42%,
        var(--border-strong) 42% 52%,
        transparent 52% 70%,
        var(--border-strong) 70% 80%,
        transparent 80%
      );
    touch-action: none;
  }
</style>
