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

<div class="alert-action {className}" data-slot="alert-action" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .alert-action
    position: absolute
    top: 0.75rem
    right: 1rem
    display: inline-flex
    align-items: center
    gap: 0.5rem
    flex-shrink: 0
</style>
