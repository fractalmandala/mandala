<script lang="ts">
  let {
    open = false,
    class: className = '',
    children,
    ...rest
  }: {
    open?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<span class="hover-card {className}" {...rest}>
  {@render children?.()}
</span>

<style lang="sass">
  .hover-card
    position: relative
    display: inline-block
</style>
