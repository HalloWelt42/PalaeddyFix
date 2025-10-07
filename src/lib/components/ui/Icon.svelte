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
    | "check"
    | "copy"
    | "speaker"
    | "stop"
    | "contrast";

  const MAP: Record<IconName, string> = {
    grid: "table-cells-large",
    upload: "cloud-arrow-up",
    download: "cloud-arrow-down",
    star: "star",
    tag: "tag",
    folder: "folder",
    trash: "trash-can",
    settings: "gear",
    search: "magnifying-glass",
    plus: "plus",
    x: "xmark",
    droplet: "droplet",
    palette: "palette",
    magic: "wand-magic-sparkles",
    info: "circle-info",
    check: "check",
    copy: "copy",
    speaker: "volume-high",
    stop: "stop",
    contrast: "circle-half-stroke",
  };
</script>

<script lang="ts">
  type Props = {
    name: IconName;
    size?: number;
  };

  const { name, size = 18 }: Props = $props();
</script>

<i
  class="fa-solid fa-{MAP[name]} ic"
  style="font-size: {size}px;"
  aria-hidden="true"
></i>

<style>
  .ic {
    display: inline-grid;
    place-items: center;
    line-height: 1;
    color: inherit;
    width: 1em;
    height: 1em;
  }
</style>
