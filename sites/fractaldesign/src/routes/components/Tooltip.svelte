<script lang="ts">
  let {
    content,
    side = 'bottom' as const,
    class: className = '',
    children,
    ...rest
  }: {
    content?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();

  let visible = $state(false);
</script>

<span class="tooltip-wrapper {className}" onmouseenter={() => visible = true} onmouseleave={() => visible = false} onfocusin={() => visible = true} onfocusout={() => visible = false} {...rest}>
  <span class="tooltip-trigger">
    {@render children?.()}
  </span>

  {#if visible && content}
    <div class="tooltip-content" data-state="open" data-side={side}>
      {content}
    </div>
  {/if}
</span>

<style lang="sass">
  .tooltip-wrapper
    position: relative
    display: inline-block

  .tooltip-trigger
    display: inline-block
    cursor: pointer

  .tooltip-content
    position: absolute
    z-index: 50
    display: inline-flex
    align-items: center
    gap: 0.375rem
    width: fit-content
    max-width: 24rem
    padding: 0.375rem 0.75rem
    border: 0
    border-radius: 0.375rem
    background-color: hsl(222 47% 11%)
    color: hsl(210 40% 98%)
    font-size: 0.75rem
    font-weight: 500
    white-space: nowrap
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
    outline: none
    pointer-events: none

    &[data-side="bottom"]
      top: calc(100% + 0.5rem)
      left: 50%
      transform: translateX(-50%)
      animation: tooltip-in-bottom 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards

    &[data-side="top"]
      bottom: calc(100% + 0.5rem)
      left: 50%
      transform: translateX(-50%)
      animation: tooltip-in-top 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards

    &[data-side="left"]
      right: calc(100% + 0.5rem)
      top: 50%
      transform: translateY(-50%)
      animation: tooltip-in-left 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards

    &[data-side="right"]
      left: calc(100% + 0.5rem)
      top: 50%
      transform: translateY(-50%)
      animation: tooltip-in-right 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards

    > svg
      width: 0.875rem
      height: 0.875rem
      flex-shrink: 0

  @keyframes tooltip-in-bottom
    from
      opacity: 0
      transform: translateX(-50%) translateY(-0.5rem) scale(0.95)
    to
      opacity: 1
      transform: translateX(-50%) translateY(0) scale(1)

  @keyframes tooltip-in-top
    from
      opacity: 0
      transform: translateX(-50%) translateY(0.5rem) scale(0.95)
    to
      opacity: 1
      transform: translateX(-50%) translateY(0) scale(1)

  @keyframes tooltip-in-left
    from
      opacity: 0
      transform: translateY(-50%) translateX(0.5rem) scale(0.95)
    to
      opacity: 1
      transform: translateY(-50%) translateX(0) scale(1)

  @keyframes tooltip-in-right
    from
      opacity: 0
      transform: translateY(-50%) translateX(-0.5rem) scale(0.95)
    to
      opacity: 1
      transform: translateY(-50%) translateX(0) scale(1)
</style>
