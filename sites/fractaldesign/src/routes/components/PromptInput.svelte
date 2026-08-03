<script lang="ts">
  let {
    value,
    placeholder = 'Ask anything…',
    class: className = '',
    children,
    ...rest
  }: {
    value?: string;
    placeholder?: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<form class="prompt-input {className}" onsubmit={(e) => e.preventDefault()} {...rest}>
  {@render children?.()}
  <div class="prompt-input-body">
    <textarea class="prompt-input-textarea" bind:value={value} {placeholder}></textarea>
  </div>
  <div class="prompt-input-footer">
    <div class="prompt-input-tools">
      <button type="button" class="prompt-input-tool-btn" aria-label="Attach file">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
      </button>
      <button type="button" class="prompt-input-tool-btn" aria-label="Search">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>
    </div>
    <button type="submit" class="prompt-input-submit" aria-label="Send message" disabled={!value?.trim()}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </button>
  </div>
</form>

<style lang="sass">
  .prompt-input
    display: flex
    flex-direction: column
    gap: 0
    border: 1px solid hsl(214 32% 91% / 0.5)
    border-radius: 0.75rem
    background-color: hsl(0 0% 100%)
    box-shadow: 0 1px 2px 0 hsl(0 0% 0% / 0.05)
    overflow: hidden

    &:focus-within
      border-color: hsl(214 32% 91%)
      box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 22% / 0.5)

  .prompt-input-body
    display: flex
    padding: 0.5rem

  .prompt-input-textarea
    flex: 1
    min-height: 3rem
    max-height: 12rem
    border: 0
    background: transparent
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    line-height: 1.5
    resize: none
    outline: none

    &::placeholder
      color: hsl(215 16% 65%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .prompt-input-footer
    display: flex
    align-items: center
    justify-content: space-between
    padding: 0.25rem 0.5rem
    border-top: 1px solid hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      border-top-color: hsl(217 33% 17%)

  .prompt-input-tools
    display: flex
    align-items: center
    gap: 0.125rem

  .prompt-input-tool-btn
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    border: 0
    border-radius: 0.375rem
    background: transparent
    color: hsl(215 16% 47%)
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &:focus-visible
      outline: 2px solid hsl(222 47% 11%)
      outline-offset: 2px

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0

    @media (prefers-color-scheme: dark)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)

  .prompt-input-submit
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    border: 0
    border-radius: 0.375rem
    background-color: hsl(222 47% 11%)
    color: hsl(0 0% 100%)
    cursor: pointer
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover:not(:disabled)
      background-color: hsl(222 47% 15%)

    &:disabled
      opacity: 0.5
      cursor: not-allowed

    > svg
      width: 1rem
      height: 1rem
      flex-shrink: 0

    @media (prefers-color-scheme: dark)
      background-color: hsl(210 40% 98%)
      color: hsl(222 47% 11%)
      &:hover:not(:disabled)
        background-color: hsl(210 40% 92%)
</style>
