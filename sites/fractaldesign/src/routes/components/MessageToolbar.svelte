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

<div class="message-toolbar {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .message-toolbar
    display: flex
    width: 100%
    align-items: center
    justify-content: space-between
    gap: 1rem
    margin-top: 1rem
</style>
