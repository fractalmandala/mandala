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
  <div class="hover-card-content {className}" data-state="open" data-side={side} {...rest}>
    {@render children?.()}
  </div>
{/if}

<style lang="sass">
  .hover-card-content
    z-index: 50
    width: 16rem
    padding: 1rem
    border: 1px solid hsl(222 47% 11% / 0.1)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
    outline: none
    transform-origin: var(--transform-origin, center)
    position: absolute

    &[data-side="bottom"]
      top: calc(100% + 0.5rem)
      left: 50%
      transform: translateX(-50%)
      animation: hover-card-in-bottom 100ms ease-out forwards

    &[data-side="top"]
      bottom: calc(100% + 0.5rem)
      left: 50%
      transform: translateX(-50%)
      animation: hover-card-in-top 100ms ease-out forwards

    &[data-side="left"]
      right: calc(100% + 0.5rem)
      top: 50%
      transform: translateY(-50%)
      animation: hover-card-in-left 100ms ease-out forwards

    &[data-side="right"]
      left: calc(100% + 0.5rem)
      top: 50%
      transform: translateY(-50%)
      animation: hover-card-in-right 100ms ease-out forwards

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)
      border-color: hsl(210 40% 98% / 0.1)

  @keyframes hover-card-in-bottom
    from
      opacity: 0
      transform: translateX(-50%) translateY(-0.5rem) scale(0.95)
    to
      opacity: 1
      transform: translateX(-50%) translateY(0) scale(1)

  @keyframes hover-card-in-top
    from
      opacity: 0
      transform: translateX(-50%) translateY(0.5rem) scale(0.95)
    to
      opacity: 1
      transform: translateX(-50%) translateY(0) scale(1)

  @keyframes hover-card-in-left
    from
      opacity: 0
      transform: translateY(-50%) translateX(0.5rem) scale(0.95)
    to
      opacity: 1
      transform: translateY(-50%) translateX(0) scale(1)

  @keyframes hover-card-in-right
    from
      opacity: 0
      transform: translateY(-50%) translateX(-0.5rem) scale(0.95)
    to
      opacity: 1
      transform: translateY(-50%) translateX(0) scale(1)
</style>
