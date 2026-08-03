<script lang="ts">
  let {
    open = false,
    side = 'bottom' as const,
    class: className = '',
    children,
    ...rest
  }: {
    open?: boolean;
    side?: 'top' | 'bottom' | 'left' | 'right';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

{#if open}
  <div class="select-content {className}" data-state="open" data-side={side} {...rest}>
    <div class="select-viewport">
      {@render children?.()}
    </div>
  </div>
{/if}

<style lang="sass">
  .select-content
    position: absolute
    z-index: 50
    min-width: 9rem
    max-height: 24rem
    overflow-x: hidden
    overflow-y: auto
    border: 1px solid hsl(222 47% 11% / 0.1)
    border-radius: 0.375rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
    transform-origin: var(--transform-origin, center)
    margin-top: 0.25rem

    &[data-state="open"]
      animation: select-in 100ms ease-out forwards

    &[data-state="closed"]
      animation: select-out 100ms ease-out forwards

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)
      border-color: hsl(210 40% 98% / 0.1)

  .select-viewport
    padding: 0.5rem

  @keyframes select-in
    from
      opacity: 0
      transform: scale(0.95)
    to
      opacity: 1
      transform: scale(1)

  @keyframes select-out
    from
      opacity: 1
      transform: scale(1)
    to
      opacity: 0
      transform: scale(0.95)
</style>
