<script lang="ts" module>
  export type IconName =
    | "grid"
    | "upload"
    | "download"
    | "star"
    | "tag"
    | "folder"
    | "trash"
    | "settings"
    | "search"
    | "plus"
    | "x"
    | "droplet"
    | "palette"
    | "magic"
    | "info"
    | "check";
</script>

<script lang="ts">
  type Props = {
    name: IconName;
    size?: number;
    stroke?: number;
  };

  const { name, size = 18, stroke = 1.8 }: Props = $props();
</script>

{#if name === "grid"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
{:else if name === "upload"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
{:else if name === "download"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
{:else if name === "star"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
{:else if name === "tag"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <path d="M20.59 13.41 13 21l-9-9V4h8l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
{:else if name === "folder"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
{:else if name === "trash"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6 17 20H7L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
{:else if name === "settings"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 14 4.6c.61.24 1.31.15 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.24.61.84 1 1.51 1H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z" />
  </svg>
{:else if name === "search"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
{:else if name === "plus"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
{:else if name === "x"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
{:else if name === "droplet"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <path d="M12 2.5 6 10a6 6 0 1 0 12 0L12 2.5z" />
  </svg>
{:else if name === "palette"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <circle cx="13.5" cy="6.5" r="1.5" />
    <circle cx="17.5" cy="10.5" r="1.5" />
    <circle cx="8.5" cy="7.5" r="1.5" />
    <circle cx="6.5" cy="12.5" r="1.5" />
    <path d="M12 2a10 10 0 1 0 0 20c1.66 0 3-1.34 3-3 0-.55-.22-1.05-.59-1.41-.36-.36-.59-.86-.59-1.41 0-1.1.9-2 2-2h1.17A4.41 4.41 0 0 0 22 10c0-4.42-4.48-8-10-8z" />
  </svg>
{:else if name === "magic"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <line x1="15" y1="4" x2="15" y2="2" />
    <line x1="15" y1="16" x2="15" y2="14" />
    <line x1="8" y1="9" x2="10" y2="9" />
    <line x1="20" y1="9" x2="22" y2="9" />
    <line x1="17.8" y1="11.8" x2="19.2" y2="13.2" />
    <line x1="10.8" y1="4.8" x2="12.2" y2="6.2" />
    <line x1="17.8" y1="6.2" x2="19.2" y2="4.8" />
    <line x1="10.8" y1="13.2" x2="12.2" y2="11.8" />
    <path d="m3 21 9-9" />
  </svg>
{:else if name === "info"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
{:else if name === "check"}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="square" stroke-linejoin="miter">
    <polyline points="20 6 9 17 4 12" />
  </svg>
{/if}
