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

<div class="confirmation-actions {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .confirmation-actions
    display: flex
    flex-wrap: wrap
    align-items: center
    gap: 0.5rem
    margin-top: 0.25rem
</style>
