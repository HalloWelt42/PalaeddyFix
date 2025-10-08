<script lang="ts">
  import Icon from "./ui/Icon.svelte";

  type Props = {
    open: boolean;
    onClose: () => void;
  };

  const { open, onClose }: Props = $props();

  function onBackdrop(e: MouseEvent): void {
    if (e.target === e.currentTarget) onClose();
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === "Escape") onClose();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div class="backdrop" onclick={onBackdrop} role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="thanks-title">
      <div class="head">
        <div class="title-group">
          <i class="fa-solid fa-heart heart-big" aria-hidden="true"></i>
          <h2 id="thanks-title">Danke sagen</h2>
        </div>
        <button type="button" class="close" onclick={onClose} title="Schließen">
          <Icon name="x" size={16} />
        </button>
      </div>

      <div class="body">
        <p class="lead">
          PaläddyFix ist kostenlos und läuft ohne Tracker komplett in deinem Browser.
          Wenn dir das Werkzeug etwas wert ist, freue ich mich über eine kleine
          Aufmerksamkeit -- oder einfach ein Sternchen auf GitHub.
        </p>

        <div class="options">
          <a
            class="opt opt-primary"
            href="https://ko-fi.com/hallowelt42"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="coffee" size={18} />
            <div class="opt-text">
              <span class="opt-title">Ko-fi</span>
              <span class="opt-sub">Einmal-Spende, kein Konto nötig</span>
            </div>
          </a>

          <a
            class="opt"
            href="https://github.com/HalloWelt42/PalaeddyFix"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fa-brands fa-github" style="font-size: 18px;" aria-hidden="true"></i>
            <div class="opt-text">
              <span class="opt-title">GitHub</span>
              <span class="opt-sub">Stern geben, Issues melden, Code ansehen</span>
            </div>
          </a>

          <div class="opt opt-crypto">
            <i class="fa-brands fa-bitcoin" style="font-size: 18px;" aria-hidden="true"></i>
            <div class="opt-text">
              <span class="opt-title">Bitcoin</span>
              <span class="opt-sub">bc1q -- Adresse bei Bedarf per Issue anfragen</span>
            </div>
          </div>
        </div>

        <p class="outro">
          Danke fürs Nutzen und fürs Teilen.
          <i class="fa-solid fa-heart inline-heart" aria-hidden="true"></i>
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    z-index: 150;
    backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    width: 520px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 80px);
    display: grid;
    grid-template-rows: auto 1fr;
    box-shadow: 0 24px 64px #000a;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
  }
  .title-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .heart-big {
    font-size: 20px;
    color: #ef4444;
    filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.5));
    animation: heartbeat 1.5s ease-in-out infinite;
  }
  .head h2 {
    font-family: var(--font-button);
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }
  .close {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-dim);
    cursor: pointer;
    border-radius: var(--radius-btn);
  }
  .close:hover {
    color: var(--text);
    background: var(--surface-2);
  }
  .body {
    padding: 18px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .lead {
    font-family: var(--font-button);
    font-size: 15px;
    font-weight: 500;
    color: var(--text);
    line-height: 1.55;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 4px 0;
  }
  .opt {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    color: var(--text);
    text-decoration: none;
    border-radius: 4px;
    transition: border-color 0.12s, background 0.12s;
  }
  .opt:hover {
    border-color: var(--text);
    background: var(--surface-3);
  }
  .opt-primary {
    border-color: var(--accent-line);
    background: var(--accent-soft);
  }
  .opt-primary:hover {
    border-color: var(--accent);
  }
  .opt-crypto {
    cursor: default;
    opacity: 0.78;
  }
  .opt-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .opt-title {
    font-family: var(--font-button);
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .opt-sub {
    font-family: var(--font-button);
    font-size: 12px;
    color: var(--text-dim);
  }

  .outro {
    font-family: var(--font-button);
    font-size: 13px;
    color: var(--text-dim);
    text-align: center;
    margin-top: 6px;
  }
  .inline-heart {
    color: #ef4444;
    font-size: 11px;
    margin-left: 2px;
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    15% { transform: scale(1.25); }
    30% { transform: scale(1); }
    45% { transform: scale(1.15); }
    60% { transform: scale(1); }
  }
</style>
