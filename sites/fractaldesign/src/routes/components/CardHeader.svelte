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

<div class="card-header {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .card-header
    display: grid
    grid-auto-rows: min-content
    grid-template-columns: 1fr auto
    gap: 0.375rem
    padding: 1.5rem 1.5rem 0
    align-items: start

    .card[data-size="sm"] &
      padding: 1rem 1rem 0
</style>
