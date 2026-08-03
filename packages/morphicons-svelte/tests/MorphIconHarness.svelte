<script module lang="ts">
  export type MorphIconHarnessProps = {
    icon?: string;
    from?: string;
    to?: string;
    progress?: number;
  };

  export type MorphIconHandle = {
    set(nextIcon: string): void;
  };
</script>

<script lang="ts">
  import MorphIcon from "../src/lib/MorphIcon.svelte";

  let { icon, from, to, progress = 0 }: MorphIconHarnessProps = $props();
  let currentIcon = $state<string | undefined>();
  let currentFrom = $state<string | undefined>();
  let currentTo = $state<string | undefined>();
  let currentProgress = $state(0);
  let morphIcon: MorphIconHandle | undefined;

  $effect(() => {
    currentIcon = icon;
    currentFrom = from;
    currentTo = to;
    currentProgress = progress;
  });

  export function update(next: Partial<MorphIconHarnessProps>): void {
    if ("icon" in next) currentIcon = next.icon;
    if ("from" in next) currentFrom = next.from;
    if ("to" in next) currentTo = next.to;
    if ("progress" in next) currentProgress = next.progress ?? 0;
  }

  export function set(nextIcon: string): void {
    morphIcon?.set(nextIcon);
  }
</script>

<MorphIcon
  bind:this={morphIcon}
  icon={currentIcon}
  from={currentFrom}
  to={currentTo}
  progress={currentProgress}
/>
