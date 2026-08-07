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

<div class="card-content {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .card-content
    padding: 0 1.5rem
    .card[data-size="sm"] &
      padding: 0 1rem
</style>
