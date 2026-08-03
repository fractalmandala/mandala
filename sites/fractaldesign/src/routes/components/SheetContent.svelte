<script lang="ts">
  let {
    open = false,
    side = 'right' as const,
    class: className = '',
    children,
    ...rest
  }: {
    open?: boolean;
    side?: 'left' | 'right' | 'top' | 'bottom';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

{#if open}
  <div class="sheet-content sheet-content--{side} {className}" data-state="open" data-side={side} {...rest}>
    {@render children?.()}
  </div>
{/if}

<style lang="sass">
  .sheet-content
    position: fixed
    z-index: 50
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    box-shadow: -4px 0 24px hsl(0 0% 0% / 0.12)

    &--right
      top: 0
      right: 0
      bottom: 0
      width: 24rem
      max-width: 100vw
      animation: sheet-in-right 200ms ease-out forwards

    &--left
      top: 0
      left: 0
      bottom: 0
      width: 24rem
      max-width: 100vw
      animation: sheet-in-left 200ms ease-out forwards

    &--top
      top: 0
      left: 0
      right: 0
      height: auto
      animation: sheet-in-top 200ms ease-out forwards

    &--bottom
      bottom: 0
      left: 0
      right: 0
      height: auto
      animation: sheet-in-bottom 200ms ease-out forwards

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)

  @keyframes sheet-in-right
    from
      transform: translateX(100%)
    to
      transform: translateX(0)

  @keyframes sheet-in-left
    from
      transform: translateX(-100%)
    to
      transform: translateX(0)

  @keyframes sheet-in-top
    from
      transform: translateY(-100%)
    to
      transform: translateY(0)

  @keyframes sheet-in-bottom
    from
      transform: translateY(100%)
    to
      transform: translateY(0)
</style>
