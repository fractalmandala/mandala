<script lang="ts">
  let {
    open = false,
    onclick,
    class: className = '',
    ...rest
  }: {
    open?: boolean;
    onclick?: (e: MouseEvent) => void;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

{#if open}
  <div class="sheet-overlay {className}" data-state="open" {onclick} {...rest}></div>
{/if}

<style lang="sass">
  .sheet-overlay
    position: fixed
    inset: 0
    z-index: 50
    background-color: hsl(0 0% 0% / 0.5)
    animation: sheet-overlay-in 150ms ease-out forwards

  @keyframes sheet-overlay-in
    from
      opacity: 0
    to
      opacity: 1
</style>
