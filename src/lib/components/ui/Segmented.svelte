<script lang="ts" generics="T extends string">
  type Option = { value: T; label: string };

  type Props = {
    options: Option[];
    value: T;
    onchange: (value: T) => void;
  };

  const { options, value, onchange }: Props = $props();
</script>

<div class="seg">
  {#each options as opt (opt.value)}
    <button
      type="button"
      class:active={opt.value === value}
      onclick={() => onchange(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

<style>
  .seg {
    display: inline-flex;
    border: 1px solid var(--border-strong);
    background: var(--surface-2);
    border-radius: 3px;
    overflow: hidden;
  }
  button {
    background: transparent;
    color: var(--text-dim);
    border: 0;
    padding: 4px 10px;
    font-family: var(--font-button);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
  }
  button + button {
    border-left: 1px solid var(--border-strong);
  }
  button.active {
    background: var(--text);
    color: var(--bg);
  }
</style>
