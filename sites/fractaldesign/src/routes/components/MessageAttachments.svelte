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

<div class="message-attachments {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .message-attachments
    display: flex
    margin-left: auto
    width: fit-content
    flex-wrap: wrap
    align-items: flex-start
    gap: 0.5rem
</style>
