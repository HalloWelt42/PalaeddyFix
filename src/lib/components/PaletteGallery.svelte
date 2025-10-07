<script lang="ts">
  import Icon from "./ui/Icon.svelte";
</script>

<div class="pal-gallery">
  <div class="toolbar">
    <span class="title"><b>Paletten</b></span>
    <span class="hint">Kommt als nächstes -- eigene Paletten anlegen, speichern, mergen.</span>
  </div>
  <div class="body">
    <div class="empty">
      <Icon name="palette" size={48} />
      <h3>Noch keine eigenen Paletten</h3>
      <p>
        Sobald die Paletten-Verwaltung eingebaut ist, landen hier gespeicherte
        Arbeits-Paletten aus Analyse-Ergebnissen, kuratierte Sammlungen und
        Importe aus GIMP-, CSS- oder JSON-Dateien.
      </p>
    </div>
  </div>
</div>

<style>
  .pal-gallery {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .toolbar {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    gap: 14px;
  }
  .title {
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 500;
  }
  .title :global(b) {
    color: var(--text);
  }
  .hint {
    font-family: var(--font-button);
    font-size: 11px;
    color: var(--text-mute);
  }

  .body {
    flex: 1;
    overflow: auto;
    display: grid;
    place-items: center;
    padding: 40px;
  }
  .empty {
    max-width: 420px;
    text-align: center;
    color: var(--text-dim);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .empty :global(.ic) {
    color: var(--text-mute);
  }
  .empty h3 {
    font-family: var(--font-button);
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }
  .empty p {
    font-family: var(--font-button);
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-dim);
  }
</style>
