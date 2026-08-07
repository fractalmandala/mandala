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

<div class="alert-description {className}" data-slot="alert-description" {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .alert-description
    grid-column: 2
    margin: 0
    font-size: 0.875rem
    line-height: 1.4
    color: inherit
    opacity: 0.9

    > *:first-child
      margin-top: 0
    > *:last-child
      margin-bottom: 0
</style>
