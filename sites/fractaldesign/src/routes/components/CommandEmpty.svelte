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

<div class="command-empty {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .command-empty
    padding: 1.5rem 1rem
    text-align: center
    font-size: 0.875rem
    color: hsl(215 16% 47%)
</style>
