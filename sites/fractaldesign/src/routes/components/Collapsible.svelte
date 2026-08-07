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

<div class="collapsible {className}" data-state={open ? 'open' : 'closed'} {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .collapsible
    display: flex
    flex-direction: column
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
</style>
