<script lang="ts">
  let {
    active = false,
    class: className = '',
    children,
    ...rest
  }: {
    active?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

{#if active}
  <div class="tabs-content {className}" role="tabpanel" {...rest}>
    {@render children?.()}
  </div>
{/if}

<style lang="sass">
  .tabs-content
    flex: 1 1 auto
    outline: none
    font-size: 0.875rem
    color: hsl(222 47% 11%)

    &:focus-visible
      outline: none
      box-shadow: 0 0 0 3px hsl(222 47% 11% / 0.5)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
</style>
