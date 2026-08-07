<script lang="ts">
  let {
    title,
    streaming = false,
    open = true,
    class: className = '',
    children,
    ...rest
  }: {
    title?: string;
    streaming?: boolean;
    open?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class="plan {className}" {...rest}>
  <div class="plan-header">
    <button class="plan-trigger" type="button" aria-expanded={open}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6"/><path d="M15 2v6"/><path d="M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M12 18v-4"/><path d="M8 14h8"/></svg>
      <span class:shimmer={streaming}>{title || 'Plan'}</span>
      {#if streaming}
        <span class="plan-streaming-indicator"></span>
      {/if}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  </div>
  {#if open}
    <div class="plan-content" data-state={open ? 'open' : 'closed'}>
      <div>
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>

<style lang="sass">
  .plan
    display: flex
    flex-direction: column
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.75rem
    background-color: hsl(0 0% 100%)
    color: hsl(222 47% 11%)
    box-shadow: none

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)
      color: hsl(210 40% 98%)

  .plan-header
    padding: 1.5rem 1.5rem 0

  .plan-trigger
    display: inline-flex
    align-items: center
    gap: 0.5rem
    width: 100%
    padding: 0
    border: 0
    background: transparent
    color: inherit
    font-size: 0.875rem
    font-weight: 600
    cursor: pointer
    transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      color: hsl(215 16% 47%)

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
      margin-left: auto
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1)
      transform: rotate(0deg)

    &[aria-expanded="true"] > svg:last-of-type
      transform: rotate(180deg)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  .plan-content
    padding: 0 1.5rem 1.5rem
    display: grid
    grid-template-rows: 1fr
    overflow: hidden
    transition: grid-template-rows 200ms cubic-bezier(0.4, 0, 0.2, 1)

    &[data-state="closed"]
      grid-template-rows: 0fr

    > div
      min-height: 0
      padding-top: 0.75rem

  .plan-streaming-indicator
    display: inline-block
    width: 0.5rem
    height: 0.5rem
    border-radius: 50%
    background-color: hsl(142 71% 45%)
    animation: pulse 2s ease-in-out infinite

    @keyframes pulse
      0%, 100%
        opacity: 1
      50%
        opacity: 0.5
</style>
