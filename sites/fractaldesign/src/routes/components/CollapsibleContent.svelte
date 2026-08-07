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

<div class="collapsible-content {className}" data-state={open ? 'open' : 'closed'} {...rest}>
  <div>
    {@render children?.()}
  </div>
</div>

<style lang="sass">
  .collapsible-content
    display: grid
    grid-template-rows: 1fr
    overflow: hidden
    transition: grid-template-rows 200ms cubic-bezier(0.4, 0, 0.2, 1)

    &[data-state="closed"]
      grid-template-rows: 0fr

    &[data-state="open"]
      grid-template-rows: 1fr

    > div
      min-height: 0
      padding-top: 0.5rem

    &[data-state="open"]
      animation: collapsible-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards

    &[data-state="closed"]
      animation: collapsible-out 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards

  @keyframes collapsible-in
    from
      opacity: 0
      transform: translateY(-8px)
    to
      opacity: 1
      transform: translateY(0)

  @keyframes collapsible-out
    from
      opacity: 1
      transform: translateY(0)
    to
      opacity: 0
      transform: translateY(-8px)
</style>
