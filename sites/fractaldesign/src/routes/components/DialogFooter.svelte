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

<div class="dialog-footer {className}" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .dialog-footer
    display: flex
    flex-direction: column-reverse
    gap: 0.5rem

    @media (min-width: 640px)
      flex-direction: row
      justify-content: flex-end
</style>
