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

<div class="command-loading {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .command-loading
    padding: 1rem
    text-align: center
    font-size: 0.875rem
    color: hsl(215 16% 47%)
</style>
