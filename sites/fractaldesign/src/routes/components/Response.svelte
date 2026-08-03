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

<div class="response {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .response
    display: flex
    flex-direction: column
    gap: 1rem
    width: 100%
    font-size: 0.875rem
    line-height: 1.6
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
</style>
