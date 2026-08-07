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

<p class="artifact-title {className}" {...rest}>
  {@render children?.()}
</p>

<style lang="sass">
  .artifact-title
    margin: 0
    font-size: 0.875rem
    font-weight: 500
    line-height: 1.25
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
</style>
