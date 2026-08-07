<script lang="ts">
  let {
    open = false,
    class: className = '',
    children,
    ...rest
  }: {
    open?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

{#if open}
  <div class="dialog-content {className}" data-state="open" role="dialog" aria-modal="true" {...rest}>
    {@render children?.()}
    <button class="dialog-close" type="button" aria-label="Close" onclick={() => open = false}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
{/if}

<style lang="sass">
  .dialog-content
    position: fixed
    top: 50%
    left: 50%
    z-index: 50
    display: grid
    width: calc(100% - 2rem)
    max-width: 28rem
    gap: 1.5rem
    padding: 1.5rem
    transform: translate(-50%, -50%)
    border: 1px solid hsl(222 47% 11% / 0.1)
    border-radius: 0.75rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    box-shadow: 0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)
    outline: none
    animation: dialog-in 100ms ease-out forwards

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)
      border-color: hsl(210 40% 98% / 0.1)

  @keyframes dialog-in
    from
      opacity: 0
      transform: translate(-50%, -50%) scale(0.95)
    to
      opacity: 1
      transform: translate(-50%, -50%) scale(1)

  .dialog-close
    position: absolute
    top: 1rem
    right: 1rem
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    padding: 0
    border: 1px solid transparent
    border-radius: 0.375rem
    background-color: transparent
    color: hsl(215 16% 47%)
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.4)

    > svg
      width: 1rem
      height: 1rem
</style>
