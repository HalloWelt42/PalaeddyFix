<script lang="ts">
  import Icon from "./Icon.svelte";

  type Props = {
    open: boolean;
    title: string;
    label?: string;
    defaultValue?: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    mode?: "prompt" | "confirm";
    message?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
  };

  const {
    open,
    title,
    label = "Name",
    defaultValue = "",
    placeholder = "",
    confirmLabel = "OK",
    cancelLabel = "Abbrechen",
    danger = false,
    mode = "prompt",
    message = "",
    onConfirm,
    onCancel,
  }: Props = $props();

  let input = $state<HTMLInputElement | null>(null);
  let value = $state<string>("");

  $effect(() => {
    if (open) {
      value = defaultValue;
      queueMicrotask(() => {
        input?.focus();
        input?.select();
      });
    }
  });

  function submit(): void {
    if (mode === "prompt" && !value.trim()) return;
    onConfirm(value.trim());
  }

  function onKey(e: KeyboardEvent): void {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Enter" && mode === "prompt") {
      e.preventDefault();
      submit();
    }
  }

  function onBackdrop(e: MouseEvent): void {
    if (e.target === e.currentTarget) onCancel();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div class="backdrop" onclick={onBackdrop} role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="prompt-title">
      <div class="head">
        <h2 id="prompt-title">{title}</h2>
        <button type="button" class="close" onclick={onCancel} title="Schließen">
          <Icon name="x" size={14} />
        </button>
      </div>
      <div class="body">
        {#if mode === "prompt"}
          <label for="prompt-input" class="label">{label}</label>
          <input
            id="prompt-input"
            type="text"
            bind:this={input}
            bind:value
            {placeholder}
          />
        {:else if message}
          <p class="msg">{message}</p>
        {/if}
      </div>
      <div class="actions">
        <button type="button" class="btn" onclick={onCancel}>{cancelLabel}</button>
        <button
          type="button"
          class="btn btn-primary"
          class:btn-danger={danger}
          onclick={submit}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: center;
    z-index: 180;
    backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    width: 420px;
    max-width: calc(100vw - 32px);
    box-shadow: 0 24px 48px #000a;
    display: grid;
    grid-template-rows: auto 1fr auto;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .head h2 {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }
  .close {
    width: 26px;
    height: 26px;
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
    background: var(--surface-3);
  }
  .body {
    padding: 14px;
  }
  .label {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }
  input[type="text"] {
    width: 100%;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    padding: 8px 10px;
    font-family: var(--font-sans);
    font-size: 13px;
    border-radius: var(--radius-btn);
    outline: none;
  }
  input[type="text"]:focus {
    border-color: var(--accent-line);
  }
  .msg {
    font-family: var(--font-button);
    font-size: 13px;
    color: var(--text);
    line-height: 1.5;
    margin: 0;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 10px 14px;
    border-top: 1px solid var(--border);
    background: var(--surface-2);
  }
  .btn {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    color: var(--text);
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: var(--radius-btn);
    cursor: pointer;
  }
  .btn:hover {
    border-color: var(--text);
  }
  .btn-primary {
    background: var(--text);
    color: var(--bg);
    border-color: var(--text);
  }
  .btn-primary:hover {
    opacity: 0.9;
  }
  .btn-danger {
    background: #7f1d1d;
    color: #fff;
    border-color: #7f1d1d;
  }
  .btn-danger:hover {
    opacity: 0.9;
  }
</style>
