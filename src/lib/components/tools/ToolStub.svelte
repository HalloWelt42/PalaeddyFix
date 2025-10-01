<script lang="ts">
  import Icon from "../ui/Icon.svelte";

  type Props = {
    title: string;
    plannedIn: string;
    description: string;
  };

  const { title, plannedIn, description }: Props = $props();
</script>

<div class="stub">
  <div class="tag">
    <Icon name="info" size={11} /> Kommt in {plannedIn}
  </div>
  <h4>{title}</h4>
  <p>{description}</p>
</div>

<style>
  .stub {
    padding: 30px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    color: var(--text-dim);
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text);
  }
  h4 {
    font-family: var(--font-button);
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }
  p {
    font-family: var(--font-button);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-dim);
    max-width: 280px;
    line-height: 1.5;
  }
</style>
