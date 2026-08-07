<script lang="ts">
  let {
    code = '',
    class: className = '',
    ...rest
  }: {
    code?: string;
    class?: string;
    [key: string]: unknown;
  } = $props();

  let copied = $state(false);

  async function handleClick() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch {
      // fallback
    }
  }
</script>

<button class="code-copy-button {className}" type="button" onclick={handleClick} aria-label={copied ? 'Copied' : 'Copy code'} {...rest}>
  {#if copied}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
  {/if}
</button>

<style lang="sass">
  .code-copy-button
    position: absolute
    top: 0.5rem
    right: 0.5rem
    display: inline-flex
    align-items: center
    justify-content: center
    width: 2rem
    height: 2rem
    padding: 0
    border: 0
    border-radius: 0.375rem
    background-color: transparent
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
      color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
</style>
