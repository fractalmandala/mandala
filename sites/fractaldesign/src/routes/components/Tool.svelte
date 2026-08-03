<script lang="ts">
  let {
    name = '',
    arguments: toolArgs = '',
    status = 'running' as const,
    result,
    open = false,
    class: className = '',
    children,
    ...rest
  }: {
    name?: string;
    arguments?: string;
    status?: 'running' | 'complete' | 'error';
    result?: string;
    open?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="tool {className}" data-status={status} {...rest}>
  <button class="tool-trigger" type="button" aria-expanded={open}>
    {#if status === 'running'}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 4 6v4l6 4"/><path d="M18 8v2"/><path d="M18 12v2"/><path d="M18 16v2"/><path d="M14.5 10.5 18 8l3.5 2.5"/></svg>
    {:else if status === 'complete'}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
    {/if}
    <span class="tool-name">{name}</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  {#if open}
    <div class="tool-content" data-state="open">
      <div class="tool-args">
        <pre><code>{toolArgs}</code></pre>
      </div>
      {#if result}
        <div class="tool-result">
          <pre><code>{result}</code></pre>
        </div>
      {/if}
      {@render children?.()}
    </div>
  {/if}
</div>

<style lang="sass">
  .tool
    display: flex
    flex-direction: column
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.5rem
    background-color: hsl(0 0% 100%)
    overflow: hidden

    &[data-status="running"]
      border-left: 3px solid hsl(222 47% 11%)

    &[data-status="complete"]
      border-left: 3px solid hsl(142 71% 45%)

    &[data-status="error"]
      border-left: 3px solid hsl(0 84% 60%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)

  .tool-trigger
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0.5rem 0.75rem
    border: 0
    background: transparent
    color: hsl(222 47% 11%)
    font-size: 0.875rem
    cursor: pointer
    width: 100%
    text-align: left
    transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      background-color: hsl(210 40% 96%)

    > svg:first-of-type
      width: 1rem
      height: 1rem
      flex-shrink: 0

    > svg:last-of-type
      width: 1rem
      height: 1rem
      flex-shrink: 0
      margin-left: auto
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &[aria-expanded="true"] > svg:last-of-type
      transform: rotate(180deg)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      &:hover
        background-color: hsl(217 33% 17%)

  .tool-name
    font-weight: 500

  .tool-content
    padding: 0.5rem 0.75rem
    border-top: 1px solid hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      border-top-color: hsl(217 33% 17%)

  .tool-args, .tool-result
    pre
      margin: 0
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
      font-size: 0.75rem
      line-height: 1.5
      code
        word-break: break-word

  .tool-args
    color: hsl(215 16% 47%)
    pre
      padding: 0.5rem
      background-color: hsl(210 40% 96%)
      border-radius: 0.25rem

    @media (prefers-color-scheme: dark)
      pre
        background-color: hsl(217 33% 17%)

  .tool-result
    margin-top: 0.5rem
    color: hsl(222 47% 11%)
    pre
      padding: 0.5rem
      background-color: hsl(210 40% 96%)
      border-radius: 0.25rem

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)
      pre
        background-color: hsl(217 33% 17%)
</style>
