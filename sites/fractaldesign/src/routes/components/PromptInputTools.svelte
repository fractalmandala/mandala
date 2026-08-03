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

<div class="prompt-input-tools {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .prompt-input-tools
    display: flex
    align-items: center
    gap: 0.125rem
</style>
