<script lang="ts">
  let {
    title,
    open = false,
    class: className = '',
    children,
    ...rest
  }: {
    title?: string;
    open?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="task {className}" {...rest}>
  <button class="task-trigger" type="button" aria-expanded={open}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/></svg>
    <span>{title || 'Task'}</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  {#if open}
    <div class="task-content" data-state="open">
      <div>
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>

<style lang="sass">
  .task
    display: flex
    flex-direction: column
    gap: 0.5rem
    color: hsl(222 47% 11%)
    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .task-trigger
    display: inline-flex
    align-items: center
    gap: 0.5rem
    padding: 0
    border: 0
    background: transparent
    color: hsl(215 16% 47%)
    font-size: 0.875rem
    cursor: pointer
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
      color: hsl(215 16% 47%)

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

  .task-content
    margin-left: 1rem
    border-left: 2px solid hsl(214 32% 91%)
    padding-left: 0.75rem
    display: grid
    grid-template-rows: 1fr
    overflow: visible

    > div
      min-height: 0

    @media (prefers-color-scheme: dark)
      border-left-color: hsl(217 33% 17%)
</style>
