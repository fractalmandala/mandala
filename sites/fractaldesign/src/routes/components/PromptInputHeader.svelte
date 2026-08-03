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

<div class="prompt-input-header {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .prompt-input-header
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0.25rem 0.5rem
    flex-wrap: wrap
</style>
