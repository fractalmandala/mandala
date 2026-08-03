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
  <div class="dropdown-menu-content {className}" data-state="open" {...rest}>
    {@render children?.()}
  </div>
{/if}

<style lang="sass">
  .dropdown-menu-content
    z-index: 50
    min-width: 8rem
    max-height: 24rem
    overflow-x: hidden
    overflow-y: auto
    padding: 0.25rem
    border: 1px solid hsl(222 47% 11% / 0.1)
    border-radius: 0.375rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
    outline: none
    position: absolute
    margin-top: 0.25rem
    animation: dropdown-menu-in 100ms ease-out forwards

    &[data-state="closed"]
      animation: dropdown-menu-out 100ms ease-out forwards
      overflow: hidden

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)
      border-color: hsl(210 40% 98% / 0.1)

  @keyframes dropdown-menu-in
    from
      opacity: 0
      transform: scale(0.95)
    to
      opacity: 1
      transform: scale(1)

  @keyframes dropdown-menu-out
    from
      opacity: 1
      transform: scale(1)
    to
      opacity: 0
      transform: scale(0.95)
</style>
