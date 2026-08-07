<script lang="ts">
  let {
    current = 0,
    total = 1,
    onPrev,
    onNext,
    class: className = '',
    children,
    ...rest
  }: {
    current?: number;
    total?: number;
    onPrev?: (e: MouseEvent) => void;
    onNext?: (e: MouseEvent) => void;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="message-branch {className}" {...rest}>
  <div class="message-branch-content">
    {@render children?.()}
  </div>

  <div class="message-branch-selector">
    <button class="message-branch-previous" type="button" aria-label="Previous branch" disabled={current === 0} onclick={onPrev}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <span class="message-branch-page">{current + 1} of {total}</span>
    <button class="message-branch-next" type="button" aria-label="Next branch" disabled={current >= total - 1} onclick={onNext}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>
</div>

<style lang="sass">
  .message-branch
    display: flex
    width: 100%
    flex-direction: column
    gap: 0.5rem

  .message-branch-content
    display: flex
    flex-direction: column
    gap: 0.5rem
    width: 100%

  .message-branch-selector
    display: inline-flex
    align-items: stretch
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    overflow: hidden
    width: fit-content

    > *:first-child
      border-top-left-radius: 0.375rem
      border-bottom-left-radius: 0.375rem
    > *:last-child
      border-top-right-radius: 0.375rem
      border-bottom-right-radius: 0.375rem
    > *:not(:first-child):not(:last-child)
      border-radius: 0

    button
      display: inline-flex
      align-items: center
      justify-content: center
      width: 1.75rem
      height: 1.75rem
      border: 1px solid transparent
      border-radius: 0.375rem
      background-color: transparent
      color: hsl(215 16% 47%)
      cursor: pointer
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

      &:hover:not(:disabled)
        background-color: hsl(210 40% 96%)
        color: hsl(222 47% 11%)

      &:focus-visible
        outline: 2px solid hsl(222 47% 11%)
        outline-offset: 2px

      &:disabled
        pointer-events: none
        opacity: 0.5

      > svg
        width: 1rem
        height: 1rem
        flex-shrink: 0

    @media (prefers-color-scheme: dark)
      border-color: hsl(217 33% 17%)
      button
        color: hsl(215 16% 65%)
        &:hover:not(:disabled)
          background-color: hsl(217 33% 17%)
          color: hsl(210 40% 98%)

  .message-branch-page
    display: inline-flex
    align-items: center
    padding: 0 0.5rem
    background-color: transparent
    border: 0
    font-size: 0.75rem
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    color: hsl(215 16% 47%)
    user-select: none
    -webkit-user-select: none

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
</style>
