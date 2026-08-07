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

<div class="card-action {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .card-action
    grid-column: 2
    grid-row: span 2 / span 2
    align-self: center
    justify-self: end
    display: flex
    align-items: center
    gap: 0.5rem
</style>
