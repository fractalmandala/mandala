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

<div class="dialog-header {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .dialog-header
    display: flex
    flex-direction: column
    gap: 0.5rem
    text-align: center
</style>
