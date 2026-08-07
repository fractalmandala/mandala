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

<div class="artifact-actions {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .artifact-actions
    display: flex
    align-items: center
    gap: 0.25rem
</style>
