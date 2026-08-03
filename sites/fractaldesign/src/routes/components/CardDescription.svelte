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

<p class="card-description {className}" {...rest}>
  {@render children?.()}
</p>

<style lang="sass">
  .card-description
    grid-column: 1
    margin: 0
    font-size: 0.8125rem
    line-height: 1.4
    color: hsl(215 16% 47%)
    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
