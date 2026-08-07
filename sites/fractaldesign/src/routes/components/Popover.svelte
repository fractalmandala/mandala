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

<div class="popover {className}" data-state={open ? 'open' : 'closed'} {...rest}>
  {@render children?.()}
</div>

<style lang="sass">
  .popover
    position: relative
    display: inline-block
</style>
