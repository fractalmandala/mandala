<script lang="ts">
  let {
    class: className = '',
    children,
    ...rest
  }: {
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="conversation {className}" {...rest}>
  <div class="conversation-content">
    {@render children?.()}
  </div>
</div>

<style lang="sass">
  .conversation
    position: relative
    display: flex
    height: 100%
    flex-direction: column
    overflow: hidden
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      color: hsl(210 40% 98%)

  .conversation-content
    display: flex
    flex: 1 1 auto
    flex-direction: column
    gap: 1rem
    overflow-y: auto
    padding: 1rem
    scroll-behavior: smooth
</style>
