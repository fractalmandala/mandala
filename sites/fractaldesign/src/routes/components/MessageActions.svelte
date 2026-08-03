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

<div class="message-actions {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .message-actions
    display: flex
    align-items: center
    gap: 0.25rem
</style>
