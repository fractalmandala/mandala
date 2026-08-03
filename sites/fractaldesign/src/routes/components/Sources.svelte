<script lang="ts">
  let {
    count = 0,
    open = false,
    class: className = '',
    children,
    ...rest
  }: {
    count?: number;
    open?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="sources {className}" {...rest}>
  <button class="sources-trigger" type="button" aria-expanded={open}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    <span>Used {count} sources</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  {#if open}
    <div class="sources-content" data-state="open">
      <div>
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>

<style lang="sass">
  .sources
    display: flex
    flex-direction: column
    width: 100%
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .sources-trigger
    display: inline-flex
    align-items: center
    gap: 0.5rem
    border: 0
    background: transparent
    color: hsl(215 16% 47%)
    font-size: 0.875rem
    cursor: pointer
    padding: 0
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px
      border-radius: 0.375rem

    > svg:first-of-type
      width: 1rem
      height: 1rem
      flex-shrink: 0
      color: hsl(217 91% 60%)

    > svg:last-of-type
      width: 1rem
      height: 1rem
      flex-shrink: 0
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)
      transform: rotate(0deg)

    &[aria-expanded="true"] > svg:last-of-type
      transform: rotate(180deg)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &:hover
        color: hsl(210 40% 98%)

  .sources-content
    display: grid
    grid-template-rows: 1fr
    overflow: hidden
    transition: grid-template-rows 200ms cubic-bezier(0.4, 0, 0.2, 1)

    &[data-state="open"]
      grid-template-rows: 1fr

    > div
      min-height: 0
      padding-top: 0.75rem
      animation: sources-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards

  @keyframes sources-in
    from
      opacity: 0
      transform: translateY(-8px)
    to
      opacity: 1
      transform: translateY(0)
</style>
