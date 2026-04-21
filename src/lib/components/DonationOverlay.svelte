<script lang="ts">
  import Icon from "./ui/Icon.svelte";

  type Props = {
    open: boolean;
    onClose: () => void;
  };

  const { open, onClose }: Props = $props();

  type Crypto = {
    id: "btc" | "doge" | "eth";
    label: string;
    symbol: string;
    icon: string;
    color: string;
    address: string;
    qr: string;
  };

  const BASE = import.meta.env.BASE_URL;

  const cryptos: Crypto[] = [
    {
      id: "btc",
      label: "BITCOIN",
      symbol: "BTC",
      icon: "fa-brands fa-bitcoin",
      color: "#f7931a",
      address: "bc1qnd599khdkv3v3npmj9ufxzf6h4fzanny2acwqr",
      qr: `${BASE}images/btc-qr.svg`,
    },
    {
      id: "doge",
      label: "DOGECOIN",
      symbol: "DOGE",
      icon: "fa-solid fa-dog",
      color: "#c3a634",
      address: "DL7tuiYCqm3xQjMDXChdxeQxqUGMACn1ZV",
      qr: `${BASE}images/doge-qr.svg`,
    },
    {
      id: "eth",
      label: "ETHEREUM",
      symbol: "ETH",
      icon: "fa-brands fa-ethereum",
      color: "#627eea",
      address: "0x8A28fc47bFFFA03C8f685fa0836E2dBe1CA14F27",
      qr: `${BASE}images/eth-qr.svg`,
    },
  ];

  let activeCrypto = $state<string | null>(null);
  let copyFeedback = $state<string | null>(null);

  function selectCrypto(id: string): void {
    activeCrypto = activeCrypto === id ? null : id;
  }

  async function copyAddress(address: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(address);
      copyFeedback = address;
      setTimeout(() => {
        if (copyFeedback === address) copyFeedback = null;
      }, 2000);
    } catch {
      /* ignore */
    }
  }

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
        <div class="intro">
          <h3 class="intro-title">PaläddyFix unterstützen</h3>
          <p class="intro-text">
            PaläddyFix ist ein nicht-kommerzielles Open-Source-Projekt und läuft
            komplett lokal in deinem Browser -- ohne Tracker, ohne Upload. Wenn
            dir das Werkzeug gefällt, freue ich mich über eine kleine
            Unterstützung.
          </p>
        </div>

        <a
          class="kofi-btn"
          href="https://ko-fi.com/hallowelt42"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="fa-solid fa-mug-hot" aria-hidden="true"></i>
          <span>Unterstütze mich auf Ko-fi</span>
        </a>

        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-label">ODER PER KRYPTOWÄHRUNG</span>
          <span class="divider-line"></span>
        </div>

        <div class="crypto-cards">
          {#each cryptos as crypto (crypto.id)}
            <button
              type="button"
              class="crypto-card"
              class:active={activeCrypto === crypto.id}
              onclick={() => selectCrypto(crypto.id)}
            >
              <div class="crypto-icon" style="--crypto-color: {crypto.color}">
                <i class={crypto.icon} aria-hidden="true"></i>
              </div>
              <span class="crypto-name">{crypto.symbol}</span>
              <span class="led" class:on={activeCrypto === crypto.id}></span>
            </button>
          {/each}
        </div>

        {#each cryptos as crypto (crypto.id)}
          {#if activeCrypto === crypto.id}
            <div class="crypto-detail">
              <div class="crypto-qr">
                <img src={crypto.qr} alt="{crypto.symbol} QR-Code" />
              </div>
              <div class="crypto-info">
                <span class="crypto-label">{crypto.label}</span>
                <code class="crypto-address">{crypto.address}</code>
                <button
                  type="button"
                  class="copy-btn"
                  onclick={() => copyAddress(crypto.address)}
                >
                  <i
                    class="fa-solid {copyFeedback === crypto.address
                      ? 'fa-check'
                      : 'fa-copy'}"
                    aria-hidden="true"
                  ></i>
                  <span>
                    {copyFeedback === crypto.address ? "KOPIERT" : "ADRESSE KOPIEREN"}
                  </span>
                </button>
              </div>
            </div>
          {/if}
        {/each}

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
    width: 560px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 80px);
    display: grid;
    grid-template-rows: auto 1fr;
    box-shadow: 0 24px 64px #000a;
    overflow: hidden;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .title-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .heart-big {
    font-size: 18px;
    color: #ef4444;
    filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.5));
    animation: heartbeat 1.5s ease-in-out infinite;
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  .head h2 {
    font-family: var(--font-button);
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }
  .close {
    width: 30px;
    height: 30px;
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
    background: var(--surface-3);
  }

  .body {
    padding: 22px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
    max-width: 460px;
  }
  .intro-title {
    font-family: var(--font-button);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--text);
    margin: 0;
  }
  .intro-text {
    font-family: var(--font-button);
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-dim);
    margin: 0;
  }

  .kofi-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 32px;
    background: #ff5f5f;
    border: none;
    border-radius: 999px;
    color: #fff;
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-decoration: none;
    cursor: pointer;
    transition: filter 0.12s, transform 0.12s;
    box-shadow: 0 4px 12px rgba(255, 95, 95, 0.35);
    text-transform: uppercase;
  }
  .kofi-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  .kofi-btn i {
    font-size: 16px;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 500px;
  }
  .divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .divider-label {
    font-family: var(--font-button);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--text-mute);
    white-space: nowrap;
  }

  .crypto-cards {
    display: flex;
    gap: 12px;
  }
  .crypto-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 22px;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-btn);
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, transform 0.12s;
    position: relative;
  }
  .crypto-card:hover {
    background: var(--surface-3);
    border-color: var(--text-dim);
    transform: translateY(-1px);
  }
  .crypto-card.active {
    background: var(--accent-soft);
    border-color: var(--accent-line);
  }
  .crypto-icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--bg);
    border: 1px solid var(--border);
    display: grid;
    place-items: center;
    font-size: 26px;
    color: var(--crypto-color);
  }
  .crypto-name {
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--text-dim);
  }
  .crypto-card.active .crypto-name {
    color: var(--text);
  }
  .led {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border-strong);
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.3);
  }
  .led.on {
    background: #22c55e;
    box-shadow: 0 0 6px #22c55e;
  }

  .crypto-detail {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-btn);
    width: 100%;
    max-width: 500px;
  }
  .crypto-qr {
    width: 112px;
    height: 112px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 4px;
    padding: 8px;
    display: grid;
    place-items: center;
  }
  .crypto-qr img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .crypto-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .crypto-label {
    font-family: var(--font-button);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--text);
  }
  .crypto-address {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    background: var(--bg);
    padding: 8px 10px;
    border-radius: 3px;
    word-break: break-all;
    line-height: 1.5;
    border: 1px solid var(--border);
  }
  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    padding: 6px 14px;
    background: var(--bg);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    color: var(--text-dim);
    font-family: var(--font-button);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  .copy-btn:hover {
    background: var(--surface-3);
    color: var(--text);
    border-color: var(--text-dim);
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    15% { transform: scale(1.25); }
    30% { transform: scale(1); }
    45% { transform: scale(1.15); }
    60% { transform: scale(1); }
  }
</style>
