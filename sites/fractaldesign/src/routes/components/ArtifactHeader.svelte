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

<div class="artifact-header {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .artifact-header
    display: flex
    align-items: center
    justify-content: space-between
    border-bottom: 1px solid hsl(214 32% 91%)
    background-color: hsl(210 40% 96% / 0.5)
    padding: 0.75rem 1rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
      border-bottom-color: hsl(217 33% 17%)
</style>
