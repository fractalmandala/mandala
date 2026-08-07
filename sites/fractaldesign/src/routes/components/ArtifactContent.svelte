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

<div class="artifact-content {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .artifact-content
    flex: 1 1 auto
    overflow-y: auto
    padding: 1rem
</style>
